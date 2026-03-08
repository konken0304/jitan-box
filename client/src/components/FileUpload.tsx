import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            Excel/CSVファイルを選択
          </p>
          <p className="text-sm text-gray-500">
            .xlsx, .xls, .csv形式に対応
          </p>
        </div>
        {selectedFile && (
          <div className="mt-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            ✓ {selectedFile.name}
          </div>
        )}
      </label>
    </div>
  );
}
