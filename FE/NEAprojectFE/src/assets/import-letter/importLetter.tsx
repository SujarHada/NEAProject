import React, { useState } from "react";
import { Download, Upload, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

interface ImportSummary {
  total_rows_processed: number;
  inserted_letters: number;
  inserted_items: number;
  skipped_rows: number;
}

const ImportLetter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportSummary(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get("/api/letters/letter-template/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "letter_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Template download error:", error);
      toast.error("Failed to download template");
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/letters/import-xlsx/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201) {
        setImportSummary(res.data.data);
        toast.success("Import completed successfully");
        setFile(null);
      }
    } catch (error: any) {
      console.error("Import error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong during import";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <div className="flex items-center gap-4 mb-8 border-b pb-4 text-gray-800">
        <Upload className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Import Letters from Excel</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 1: Download Template */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Step 1: Download Template
            </h2>
            <p className="text-blue-700 text-sm mb-4">
              Download our standardized Excel template to ensure your data format is correct.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {/* Step 2: Upload File */}
        <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
          <h2 className="text-lg font-semibold text-emerald-800 mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Step 2: Upload & Import
          </h2>
          <p className="text-emerald-700 text-sm mb-4">
            Select your populated Excel file and upload it to process the import.
          </p>
          
          <div className="mb-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block w-full border-2 border-dashed border-emerald-300 rounded-md py-3 text-center text-emerald-600 hover:bg-emerald-100 transition duration-200"
            >
              {file ? file.name : "Click to select file"}
            </label>
          </div>

          <button
            onClick={handleImport}
            disabled={!file || loading}
            className={`w-full py-2 px-4 rounded-md transition duration-200 font-medium flex items-center justify-center gap-2 ${
              !file || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileCheck className="w-4 h-4" />
            )}
            {loading ? "Processing..." : "Process Import"}
          </button>
        </div>
      </div>

      {/* Summary Section */}
      {importSummary && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            Import Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded border border-gray-100 text-center shadow-sm">
              <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Total Rows</span>
              <span className="text-xl font-bold text-gray-800">{importSummary.total_rows_processed}</span>
            </div>
            <div className="p-4 bg-white rounded border border-gray-100 text-center shadow-sm">
              <span className="block text-emerald-500 text-xs uppercase font-bold mb-1">New Letters</span>
              <span className="text-xl font-bold text-emerald-600">{importSummary.inserted_letters}</span>
            </div>
            <div className="p-4 bg-white rounded border border-gray-100 text-center shadow-sm">
              <span className="block text-emerald-500 text-xs uppercase font-bold mb-1">New Items</span>
              <span className="text-xl font-bold text-emerald-600">{importSummary.inserted_items}</span>
            </div>
            <div className="p-4 bg-white rounded border border-gray-100 text-center shadow-sm">
              <span className="block text-orange-500 text-xs uppercase font-bold mb-1">Skipped (Duplicate)</span>
              <span className="text-xl font-bold text-orange-600">{importSummary.skipped_rows}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 flex gap-3 text-sm text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-amber-800 mb-1">Important Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure the column headers in your file match the template exactly.</li>
            <li>Use <strong>YYYY.MM.DD</strong> format for dates.</li>
            <li>The system identifies duplicates based on Chalani No, Voucher No, Date, and Item details.</li>
            <li>Only unique or modified records will be added to the database.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportLetter;
