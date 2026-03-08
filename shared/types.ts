export interface AccountItem {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyRow {
  companyName: string;
  accountItemId: number | null;
  accountItemName: string | null;
  occurrences: number;
}

export interface ExcelRow {
  [key: string]: string | number | null;
}

export interface ProcessedData {
  headers: string[];
  rows: ExcelRow[];
  companies: Map<string, CompanyRow>;
}
