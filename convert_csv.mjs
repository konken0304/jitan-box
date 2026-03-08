import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

// Shift-JISのCSVを読み込み
const csvPath = '/Users/konnokensuke/Desktop/activity (6).csv';
const buffer = readFileSync(csvPath);

// Shift-JISでデコード
const decoder = new TextDecoder('shift-jis');
const csvText = decoder.decode(buffer);

// CSVをパース
const workbook = XLSX.read(csvText, { type: 'string' });

// Excelとして保存
XLSX.writeFile(workbook, 'test-data.xlsx');
console.log('✅ test-data.xlsx を作成しました');
