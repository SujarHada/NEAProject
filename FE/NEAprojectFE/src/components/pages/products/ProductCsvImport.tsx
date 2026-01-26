import { useState } from "react";

export default function ProductCsvImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setError(null);

    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selected = e.target.files[0];

    if (!selected.name.endsWith(".csv")) {
      setError("Only CSV files are allowed.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/products/import_csv/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Import failed");
      }

      setMessage(data.message || "CSV imported successfully");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white border rounded-lg shadow">
      <h1 className="text-xl font-semibold mb-2">
        Import Products (CSV)
      </h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700
                   file:mr-4 file:py-2 file:px-4
                   file:rounded file:border-0
                   file:bg-gray-100 file:text-gray-700
                   hover:file:bg-gray-200"
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {message && (
        <p className="mt-4 text-green-600 text-sm">{message}</p>
      )}

      {error && (
        <p className="mt-4 text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}
