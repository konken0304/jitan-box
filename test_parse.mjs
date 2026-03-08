import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('test-data.xlsx');
const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

console.log('=== ヘッダー行 ===');
console.log(jsonData[0]);

console.log('\n=== サンプルデータ（最初の5行） ===');
jsonData.slice(1, 6).forEach((row, i) => {
  console.log(`${i + 1}行目:`, row);
});

console.log(`\n総行数: ${jsonData.length}行`);
console.log(`総列数: ${jsonData[0].length}列`);
