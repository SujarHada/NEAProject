import api from "app/utils/api";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ProductCsvImport() {
	const { t } = useTranslation();
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
			setError(t("csvImport.errors.onlyCsvAllowed"));
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
			const res = await api.post(
				"/api/products/import_csv/",
				formData
			);
			console.log(res)

			if (res.status !== 201) {
				throw new Error(res.data.message || t("csvImport.errors.importFailed"));
			}
			setMessage(res.data.message || t("csvImport.success.importSuccess"));
		} catch (err: any) {
			setError(err.message || t("csvImport.errors.somethingWentWrong"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex-1 p-4 bg-white rounded-lg shadow">
			<h1 className="text-xl font-semibold mb-2">{t("csvImport.title")}</h1>

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
				type={"button"}
				onClick={handleUpload}
				disabled={!file || loading}
				className="mt-6 w-full bg-blue-600 text-white py-2 rounded
                   disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? t("csvImport.buttons.uploading") : t("csvImport.buttons.uploadCsv")}
			</button>

			{message && <p className="mt-4 text-green-600 text-sm">{message}</p>}

			{error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
		</div>
	);
}
