import * as XLSX from "xlsx";
import Encoding from "encoding-japanese";

export interface ExcelColumn {
  index: number;
  header: string;
  samples: (string | number)[];
  score: number;
}

export interface ExcelData {
  headers: string[];
  rows: Record<string, string | number>[];
  columns: ExcelColumn[];
  recommendedColIndex: number;
}

export interface CompanyMapping {
  name: string;
  accountItemId: number | null;
  accountItemName: string | null;
  occurrences: number;
}

/**
 * Excelファイルをパースして、列情報と推奨列を返す
 */
export function parseExcelFile(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);

        // CSVファイルの場合、Shift-JISの可能性があるため自動検出して変換
        let workbook: XLSX.WorkBook;
        const isCSV = file.name.toLowerCase().endsWith('.csv');

        if (isCSV) {
          // エンコーディングを自動検出
          const detectedEncoding = Encoding.detect(data);

          // Shift-JISまたはEUC-JPの場合、UTF-8に変換
          if (detectedEncoding === 'SJIS' || detectedEncoding === 'EUCJP') {
            const unicodeArray = Encoding.convert(data, {
              to: 'UNICODE',
              from: detectedEncoding,
            });
            const utf8String = Encoding.codeToString(unicodeArray);
            workbook = XLSX.read(utf8String, { type: "string" });
          } else {
            // UTF-8の場合はそのまま読み込み
            workbook = XLSX.read(data, { type: "array" });
          }
        } else {
          // Excel形式の場合はそのまま読み込み
          workbook = XLSX.read(data, { type: "array" });
        }

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          reject(new Error("ファイルが空です"));
          return;
        }

        // ヘッダー行を取得（1行目）
        const headers = jsonData[0].map((h, i) =>
          h?.toString() || `列${i + 1}`
        );

        // データ行を取得（2行目以降）
        const dataRows = jsonData.slice(1);

        // 各列のサンプルとスコアを計算
        const columns: ExcelColumn[] = headers.map((header, index) => {
          const columnData = dataRows
            .map((row) => row[index])
            .filter((val) => val != null && val !== "");

          const samples = columnData.slice(0, 5); // 最初の5件をサンプルとして取得
          const score = scoreColumn(columnData);

          return {
            index,
            header,
            samples,
            score,
          };
        });

        // 最もスコアが高い列を推奨
        const recommendedColIndex = columns.reduce(
          (maxIndex, col, index) =>
            col.score > columns[maxIndex].score ? index : maxIndex,
          0
        );

        // 行データをオブジェクト形式に変換
        const rows = dataRows.map((row) => {
          const obj: Record<string, string | number> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] ?? "";
          });
          return obj;
        });

        resolve({
          headers,
          rows,
          columns,
          recommendedColIndex,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 列のスコアを計算（会社名列らしさを判定）
 */
function scoreColumn(data: any[]): number {
  if (data.length === 0) return 0;

  let score = 0;

  // テキストの割合
  const textCount = data.filter((val) => typeof val === "string" && val.trim()).length;
  const textRatio = textCount / data.length;

  // テキストが少ない列は除外
  if (textRatio < 0.5) return 0;

  score += textRatio * 50;

  // 数値列は完全に除外
  const numberCount = data.filter((val) => typeof val === "number" || !isNaN(Number(val))).length;
  const numberRatio = numberCount / data.length;
  if (numberRatio > 0.3) return 0; // 数値が30%以上含まれる列は除外

  // 日付っぽい列を除外
  const datePattern = /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/;
  const dateCount = data.filter((val) =>
    typeof val === "string" && datePattern.test(val.trim())
  ).length;
  if (dateCount / data.length > 0.3) return 0; // 日付が30%以上含まれる列は除外

  // ユニーク値の割合（会社名は重複することが多い）
  const uniqueValues = new Set(data);
  const uniqueRatio = uniqueValues.size / data.length;

  // ユニーク値が多すぎる（90%以上）場合は除外（管理番号など）
  if (uniqueRatio > 0.9) {
    score -= 50;
  } else {
    // 適度なユニーク値（30-80%）は高スコア
    if (uniqueRatio >= 0.3 && uniqueRatio <= 0.8) {
      score += 40;
    }
  }

  // 平均文字数（会社名は3-30文字程度）
  const avgLength =
    data
      .filter((val) => typeof val === "string" && val.trim())
      .reduce((sum, val) => sum + val.toString().trim().length, 0) / textCount || 0;

  if (avgLength >= 3 && avgLength <= 30) {
    score += 30;
  } else if (avgLength < 3 || avgLength > 50) {
    score -= 20; // 短すぎる・長すぎる列は除外
  }

  // カタカナ・漢字・アルファベットが含まれている（会社名らしい）
  const hasJapanese = data.some((val) =>
    typeof val === "string" && /[ぁ-んァ-ヶー一-龯a-zA-Z]/.test(val)
  );
  if (hasJapanese) {
    score += 20;
  }

  return Math.max(0, score);
}

/**
 * 会社名を正規化（マッチング用）
 */
export function normalizeCompanyName(name: string | number): string {
  if (typeof name !== "string") {
    name = String(name);
  }
  return name.trim().replace(/\s+/g, " "); // 複数の空白を1つに統一
}

/**
 * 会社名の一覧を抽出（ユニークな値）
 */
export function extractCompanies(
  rows: Record<string, string | number>[],
  columnName: string
): CompanyMapping[] {
  const companyCount = new Map<string, number>();

  rows.forEach((row) => {
    const value = row[columnName];
    if (value != null && value !== "") {
      const name = normalizeCompanyName(value);
      if (name) {
        companyCount.set(name, (companyCount.get(name) || 0) + 1);
      }
    }
  });

  return Array.from(companyCount.entries())
    .map(([name, occurrences]) => ({
      name,
      accountItemId: null,
      accountItemName: null,
      occurrences,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

/**
 * Excel/CSV形式でダウンロード
 */
export function downloadAsExcel(
  rows: Record<string, string | number>[],
  headers: string[],
  filename: string = "仕訳データ.xlsx"
) {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
}

/**
 * CSV形式でダウンロード
 */
export function downloadAsCSV(
  rows: Record<string, string | number>[],
  headers: string[],
  filename: string = "仕訳データ.csv"
) {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

/**
 * TSV形式でダウンロード（スプレッドシート用、BOM付きUTF-8）
 */
export function downloadAsTSV(
  rows: Record<string, string | number>[],
  headers: string[],
  filename: string = "仕訳データ.tsv"
) {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const tsv = XLSX.utils.sheet_to_csv(worksheet, { FS: "\t" });
  const bom = "\uFEFF"; // BOM
  const blob = new Blob([bom + tsv], { type: "text/tab-separated-values;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
