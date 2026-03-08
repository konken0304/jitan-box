import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const accountItems = mysqlTable("account_items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountItem = typeof accountItems.$inferSelect;
export type NewAccountItem = typeof accountItems.$inferInsert;
