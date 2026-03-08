import { CheckCircle2, AlertCircle } from "lucide-react";
import AccountSelector from "./AccountSelector";
import type { CompanyMapping } from "../lib/excel";

interface AccountItem {
  id: number;
  name: string;
}

interface CompanyListProps {
  companies: CompanyMapping[];
  accountItems: AccountItem[];
  onAccountSelect: (companyIndex: number, accountItemId: number, accountItemName: string) => void;
}

export default function CompanyList({
  companies,
  accountItems,
  onAccountSelect,
}: CompanyListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{companies.length}件</span>の会社名を検出
        </div>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            設定済み: {companies.filter((c) => c.accountItemId).length}件
          </span>
          <span className="flex items-center gap-1 text-orange-600">
            <AlertCircle className="h-4 w-4" />
            未設定: {companies.filter((c) => !c.accountItemId).length}件
          </span>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-2">
        {companies.map((company, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              company.accountItemId
                ? "bg-green-50 border-green-200"
                : "bg-orange-50 border-orange-200"
            )}
          >
            <div className="flex items-start gap-4">
              {/* 会社名 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {company.accountItemId ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {company.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 ml-7">
                  {company.occurrences}回出現
                </div>
              </div>

              {/* 勘定科目選択 */}
              <div className="w-64">
                <AccountSelector
                  accountItems={accountItems}
                  selectedId={company.accountItemId}
                  onSelect={(id, name) => onAccountSelect(index, id, name)}
                  placeholder="勘定科目を選択"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
