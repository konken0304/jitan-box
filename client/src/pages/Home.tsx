import { useState } from "react";
import { Upload, Download, FileSpreadsheet, Check, AlertCircle, HelpCircle } from "lucide-react";
import { accountItems } from "../lib/accountItems";
import {
  parseExcelFile,
  extractCompanies,
  downloadAsExcel,
  downloadAsCSV,
  downloadAsTSV,
  normalizeCompanyName,
  type ExcelData,
  type CompanyMapping,
} from "../lib/excel";
import AccountSelector from "../components/AccountSelector";
import { Button } from "../components/ui/button";

// localStorage key
const STORAGE_KEY = "shiwake-navi-mappings";

// localStorageからマッピングを読み込む
function loadMappings(): Record<string, { accountItemId: number; accountItemName: string }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// localStorageにマッピングを保存
function saveMappings(mappings: Record<string, { accountItemId: number; accountItemName: string }>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error("Failed to save mappings:", error);
  }
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyMapping[]>([]);
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const data = await parseExcelFile(selectedFile);
      setExcelData(data);

      const recommendedHeader = data.headers[data.recommendedColIndex];
      setSelectedColumn(recommendedHeader);

      const extractedCompanies = extractCompanies(data.rows, recommendedHeader);

      // localStorageから保存済みマッピングを適用
      const savedMappings = loadMappings();
      const companiesWithMappings = extractedCompanies.map((company) => {
        const saved = savedMappings[company.name];
        if (saved) {
          return {
            ...company,
            accountItemId: saved.accountItemId,
            accountItemName: saved.accountItemName,
          };
        }
        return company;
      });

      setCompanies(companiesWithMappings);
    } catch (error) {
      console.error("ファイル解析エラー:", error);
      alert("ファイルの解析に失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColumnChange = (columnName: string) => {
    setSelectedColumn(columnName);
    if (excelData) {
      const extractedCompanies = extractCompanies(excelData.rows, columnName);

      // localStorageから保存済みマッピングを適用
      const savedMappings = loadMappings();
      const companiesWithMappings = extractedCompanies.map((company) => {
        const saved = savedMappings[company.name];
        if (saved) {
          return {
            ...company,
            accountItemId: saved.accountItemId,
            accountItemName: saved.accountItemName,
          };
        }
        return company;
      });

      setCompanies(companiesWithMappings);
      setSelectedCompanyIndex(null); // 選択をリセット
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = droppedFile.name.toLowerCase().slice(droppedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      alert("対応していないファイル形式です。.xlsx, .xls, .csv のいずれかを選択してください。");
      return;
    }

    await processFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleAccountSelect = (accountItemId: number, accountItemName: string) => {
    if (selectedCompanyIndex === null) return;

    const selectedCompany = companies[selectedCompanyIndex];
    if (!selectedCompany) return;

    // localStorageに保存
    const savedMappings = loadMappings();
    savedMappings[selectedCompany.name] = { accountItemId, accountItemName };
    saveMappings(savedMappings);

    setCompanies((prev) =>
      prev.map((company, index) =>
        index === selectedCompanyIndex
          ? { ...company, accountItemId, accountItemName }
          : company
      )
    );
  };

  const handleDownload = (format: "excel" | "csv" | "tsv") => {
    if (!excelData || !selectedColumn) return;

    const accountItemColumn = "勘定科目";
    const headers = [...excelData.headers, accountItemColumn];

    const rows = excelData.rows.map((row) => {
      const rawCompanyName = row[selectedColumn];
      const normalizedCompanyName = normalizeCompanyName(rawCompanyName);
      const company = companies.find((c) => c.name === normalizedCompanyName);

      return {
        ...row,
        [accountItemColumn]: company?.accountItemName || "",
      };
    });

    const filename = file?.name.replace(/\.[^/.]+$/, "") || "仕訳データ";
    if (format === "excel") {
      downloadAsExcel(rows, headers, `${filename}.xlsx`);
    } else if (format === "csv") {
      downloadAsCSV(rows, headers, `${filename}.csv`);
    } else if (format === "tsv") {
      downloadAsTSV(rows, headers, `${filename}.tsv`);
    }
  };

  // 取引先（ユニークな会社名）の統計
  const companyAssignedCount = companies.filter((c) => c.accountItemId).length;
  const companyUnassignedCount = companies.length - companyAssignedCount;

  // 明細（全トランザクション）の統計
  const totalTransactions = excelData?.rows.length || 0;
  const transactionAssignedCount = excelData?.rows.filter((row) => {
    if (!selectedColumn) return false;
    const companyName = row[selectedColumn];
    const company = companies.find((c) => c.name === companyName);
    return company?.accountItemId != null;
  }).length || 0;
  const transactionUnassignedCount = totalTransactions - transactionAssignedCount;

  const selectedCompany = selectedCompanyIndex !== null ? companies[selectedCompanyIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">仕訳ナビ</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* タイトルセクション */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            会社名・勘定科目 紐付け管理
          </h2>
          <p className="text-gray-600 mb-4">
            Excelから会社名を取り込み、各会社名に勘定科目を紐付けます
          </p>

          {/* アプリの特徴バナー */}
          <div className="bg-blue-600 rounded-lg p-4">
            <div className="flex items-center justify-center gap-8 text-white">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">✨</span>
                <span><strong>一度紐付ければ、次回から自動で記憶されます</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">⚡</span>
                <span>2回目以降は、アップロードするだけで完了</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">🔒</span>
                <span>データはブラウザに保存され、外部送信されません</span>
              </div>
            </div>
          </div>
        </div>

        {/* アクションバー */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <label htmlFor="file-upload">
                <Button className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Excelから会社名を取り込み
                </Button>
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {companies.length > 0 && (
                <>
                  <Button variant="outline" onClick={() => handleDownload("excel")}>
                    <Download className="w-4 h-4 mr-2" />
                    Excelに出力
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload("tsv")}>
                    <Download className="w-4 h-4 mr-2" />
                    スプシ用に出力
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm("保存されている全ての紐付け記憶を削除しますか？\n\n削除後は、会社名と勘定科目の紐付けを最初からやり直す必要があります。")) {
                    localStorage.removeItem(STORAGE_KEY);
                    alert("記憶をリセットしました。次回アップロード時は紐付けが保存されていない状態になります。");
                  }
                }}
                className="text-gray-600"
              >
                記憶をリセット
              </Button>
            </div>

            {companies.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-4">
                    <span>
                      取引先全 <strong>{companies.length}</strong> 件
                    </span>
                    <span className="text-green-600">
                      紐付け済み <strong>{companyAssignedCount}</strong>件
                    </span>
                    <span className="text-orange-600">
                      未設定 <strong>{companyUnassignedCount}</strong>件
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>
                      明細全 <strong>{totalTransactions}</strong> 件
                    </span>
                    <span className="text-green-600">
                      紐付け済み <strong>{transactionAssignedCount}</strong>件
                    </span>
                    <span className="text-orange-600">
                      未設定 <strong>{transactionUnassignedCount}</strong>件
                    </span>
                  </div>
                </div>
                <div className="relative group">
                  <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="space-y-2">
                      <div>
                        <strong>【取引先】</strong>
                        <br />
                        ユニークな会社名の数です。同じ会社で複数回取引があっても1件としてカウントされます。
                      </div>
                      <div>
                        <strong>【明細】</strong>
                        <br />
                        CSVファイルの全トランザクション（取引）の数です。
                      </div>
                      <div>
                        <strong>例:</strong> Amazonで3回買い物した場合
                        <br />
                        ・取引先: 1件（Amazon）
                        <br />
                        ・明細: 3件（各取引）
                      </div>
                    </div>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 列選択UI */}
          {excelData && excelData.headers.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社名の列を選択
              </label>
              <select
                value={selectedColumn || ""}
                onChange={(e) => handleColumnChange(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {excelData.headers.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                    {index === excelData.recommendedColIndex && " (推奨)"}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                自動検出で正しく認識されなかった場合は、手動で選択してください
              </p>
            </div>
          )}
        </div>

        {/* メインコンテンツ */}
        {companies.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {/* 左カラム: 会社名一覧 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    会社名一覧
                  </h3>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-0 top-full mt-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="space-y-2">
                        <div>下の取引先を選択すると、右側で勘定科目を紐付けできます</div>
                        <div className="pt-2 border-t border-gray-700">
                          <strong>注意:</strong> 同じ会社で複数の勘定科目がある場合（例: Amazonで仕入高と消耗品費）は、出力後にExcelで手動修正してください
                        </div>
                      </div>
                      <div className="absolute bottom-full left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("全ての会社名データを削除してリセットしますか？")) {
                      setFile(null);
                      setExcelData(null);
                      setSelectedColumn(null);
                      setCompanies([]);
                      setSelectedCompanyIndex(null);
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  まとめて削除
                </button>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {companies.map((company, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCompanyIndex(index)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedCompanyIndex === index ? "bg-blue-50 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {company.name}
                        </div>
                        {company.accountItemName ? (
                          <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {company.accountItemName}
                          </div>
                        ) : (
                          <div className="text-sm text-orange-600 mt-1">未設定</div>
                        )}
                      </div>
                      {company.accountItemId && (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 右カラム: 勘定科目の紐付け */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">勘定科目の紐付け</h3>

              {selectedCompany ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会社名
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedCompany.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      勘定科目
                    </label>
                    <AccountSelector
                      accountItems={accountItems}
                      selectedId={selectedCompany.accountItemId}
                      onSelect={handleAccountSelect}
                      placeholder="勘定科目を選択してください"
                    />
                  </div>

                  {selectedCompany.accountItemId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <strong>{selectedCompany.accountItemName}</strong> に紐付けられています
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    左の一覧から会社名を選択すると、ここで勘定科目を紐付けできます
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`bg-white rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              Excelファイルをアップロードして会社名を取り込んでください
            </p>
            <p className="text-sm text-gray-400">
              ファイルをドラッグ&ドロップ、または上のボタンをクリック
            </p>
            <p className="text-sm text-gray-400 mt-1">
              .xlsx, .xls, .csv 形式に対応
            </p>
          </div>
        )}
      </div>

      {/* ローディング */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">ファイルを解析中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
