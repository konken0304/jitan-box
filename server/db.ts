import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { accountItems } from "../drizzle/schema";
import { eq, asc } from "drizzle-orm";
import type { NewAccountItem } from "../drizzle/schema";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL || "mysql://root@localhost:3306/shiwake_navi",
});

export const db = drizzle(connection);

// 勘定科目マスタ操作
export async function getAllAccountItems() {
  return await db.select().from(accountItems).orderBy(asc(accountItems.sortOrder));
}

export async function createAccountItem(data: NewAccountItem) {
  const result = await db.insert(accountItems).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateAccountItem(
  id: number,
  data: Partial<Omit<NewAccountItem, "id">>
) {
  await db.update(accountItems).set(data).where(eq(accountItems.id, id));
}

export async function deleteAccountItem(id: number) {
  await db.delete(accountItems).where(eq(accountItems.id, id));
}

export async function bulkCreateAccountItems(items: NewAccountItem[]) {
  if (items.length === 0) return;
  await db.insert(accountItems).values(items);
}

export async function deleteAllAccountItems() {
  await db.delete(accountItems);
}
