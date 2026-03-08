import mysql from "mysql2/promise";

const expenseAccounts = [
  "仕入高",
  "外注費",
  "給料手当",
  "役員報酬",
  "賞与",
  "法定福利費",
  "福利厚生費",
  "旅費交通費",
  "通信費",
  "消耗品費",
  "事務用品費",
  "水道光熱費",
  "地代家賃",
  "賃借料",
  "保険料",
  "修繕費",
  "減価償却費",
  "租税公課",
  "荷造運賃",
  "広告宣伝費",
  "接待交際費",
  "会議費",
  "新聞図書費",
  "研修費",
  "支払手数料",
  "支払報酬",
  "車両費",
  "リース料",
  "諸会費",
  "寄付金",
  "支払利息",
  "貸倒損失",
  "貸倒引当金繰入",
  "法人税等",
  "固定資産売却損",
  "雑損失",
  "雑費",
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shiwake_navi",
  });

  console.log("🗑️  既存データを削除中...");
  await connection.query("DELETE FROM account_items");

  console.log("📝 勘定科目を登録中...");
  for (let i = 0; i < expenseAccounts.length; i++) {
    await connection.query(
      "INSERT INTO account_items (name, sortOrder) VALUES (?, ?)",
      [expenseAccounts[i], i]
    );
  }

  console.log(`✅ ${expenseAccounts.length}件の勘定科目を登録しました`);
  await connection.end();
}

seed().catch((err) => {
  console.error("❌ エラーが発生しました:", err);
  process.exit(1);
});
