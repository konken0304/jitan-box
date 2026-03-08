/**
 * 経費の勘定科目マスタデータ（静的）
 */
export interface AccountItem {
  id: number;
  name: string;
  sortOrder: number;
}

export const accountItems: AccountItem[] = [
  { id: 1, name: "仕入高", sortOrder: 0 },
  { id: 2, name: "外注費", sortOrder: 1 },
  { id: 3, name: "給料手当", sortOrder: 2 },
  { id: 4, name: "役員報酬", sortOrder: 3 },
  { id: 5, name: "賞与", sortOrder: 4 },
  { id: 6, name: "法定福利費", sortOrder: 5 },
  { id: 7, name: "福利厚生費", sortOrder: 6 },
  { id: 8, name: "旅費交通費", sortOrder: 7 },
  { id: 9, name: "通信費", sortOrder: 8 },
  { id: 10, name: "消耗品費", sortOrder: 9 },
  { id: 11, name: "事務用品費", sortOrder: 10 },
  { id: 12, name: "水道光熱費", sortOrder: 11 },
  { id: 13, name: "地代家賃", sortOrder: 12 },
  { id: 14, name: "賃借料", sortOrder: 13 },
  { id: 15, name: "保険料", sortOrder: 14 },
  { id: 16, name: "修繕費", sortOrder: 15 },
  { id: 17, name: "減価償却費", sortOrder: 16 },
  { id: 18, name: "租税公課", sortOrder: 17 },
  { id: 19, name: "荷造運賃", sortOrder: 18 },
  { id: 20, name: "広告宣伝費", sortOrder: 19 },
  { id: 21, name: "接待交際費", sortOrder: 20 },
  { id: 22, name: "会議費", sortOrder: 21 },
  { id: 23, name: "新聞図書費", sortOrder: 22 },
  { id: 24, name: "研修費", sortOrder: 23 },
  { id: 25, name: "支払手数料", sortOrder: 24 },
  { id: 26, name: "支払報酬", sortOrder: 25 },
  { id: 27, name: "車両費", sortOrder: 26 },
  { id: 28, name: "リース料", sortOrder: 27 },
  { id: 29, name: "諸会費", sortOrder: 28 },
  { id: 30, name: "寄付金", sortOrder: 29 },
  { id: 31, name: "支払利息", sortOrder: 30 },
  { id: 32, name: "貸倒損失", sortOrder: 31 },
  { id: 33, name: "貸倒引当金繰入", sortOrder: 32 },
  { id: 34, name: "法人税等", sortOrder: 33 },
  { id: 35, name: "固定資産売却損", sortOrder: 34 },
  { id: 36, name: "雑損失", sortOrder: 35 },
  { id: 37, name: "雑費", sortOrder: 36 },
];
