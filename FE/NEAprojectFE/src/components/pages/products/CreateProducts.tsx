import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { createProductInputs } from "app/interfaces/interfaces";
import axios from "axios";
import api from "app/utils/api";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { createProductFormschema } from "app/schemas/product";
import { productUnits } from "app/enum/productUnits";
import { useState } from "react";
import toast from "react-hot-toast";
import ProductCsvImport from "./ProductCsvImport";

const CreateProducts = () => {
	const { t } = useTranslation();
	// Tab State
	const [activeTab, setActiveTab] = useState<"create" | "bulk">("create");

	// Bulk Upload State
	// const [file, setFile] = useState<File | null>(null);
	// const [uploadProgress, setUploadProgress] = useState(0);
	// const [uploadStatus, setUploadStatus] = useState<
	// 	"idle" | "uploading" | "success" | "error" | "cancelled"
	// >("idle");
	// const [uploadMessage, setUploadMessage] = useState("");
	// const [uploadResults, setUploadResults] = useState<any>(null);
	// const uploadAbortController = useRef<AbortController | null>(null);

	// Product List State
	// const [products, setProducts] = useState<Product[]>([]);
	// const [loadingProducts, setLoadingProducts] = useState(false);

	// Single Creation Form
	const createproductForm = createProductFormschema(t);
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, errors },
	} = useForm<createProductInputs>({
		defaultValues: {
			name: "",
			company: "",
			unit_of_measurement: "",
			remarks: "",
		},
		resolver: zodResolver(createproductForm),
		mode: "onChange",
	});
	const navigate = useNavigate();
	const onSubmit = async (data: createProductInputs) => {
		try {
			const res = await api.post("/api/products/", data);
			if (res.status === 201) {
				navigate("/products/active-products");
			}
		} catch (err: any) {
			if (axios.isAxiosError(err)) {
				if (err.response) {
					// alert(err.response.data.message)
					toast.error(
						err.response.data.message || "Could not create the product",
					);
				} else if (err.request) {
					console.error("Network Error: Server not reachable");
				} else {
					console.error("Axios Error:", err.message);
				}
			} else {
				console.error("Unexpected Error:", err);
			}
		}
	};

	// Bulk Functions
	// const fetchProducts = async () => {
	// 	setLoadingProducts(true);
	// 	try {
	// 		const res = await api.get("/api/products/");
	// 		setProducts(res.data.results || []);
	// 	} catch (err) {
	// 		console.error("Error fetching products", err);
	// 	} finally {
	// 		setLoadingProducts(false);
	// 	}
	// };

	// useEffect(() => {
	// 	if (activeTab === "bulk") {
	// 		fetchProducts();
	// 	}
	// }, [activeTab]);

	// const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	if (e.target.files && e.target.files.length > 0) {
	// 		const selectedFile = e.target.files[0];

	// 		// Validate Type
	// 		if (
	// 			selectedFile.type !== "text/csv" &&
	// 			!selectedFile.name.toLowerCase().endsWith(".csv")
	// 		) {
	// 			alert("Please select a valid CSV file.");
	// 			return;
	// 		}

	// 		// Validate Size (10MB Limit)
	// 		const MAX_FILE_SIZE = 10 * 1024 * 1024;
	// 		if (selectedFile.size > MAX_FILE_SIZE) {
	// 			alert("File size exceeds 10MB limit.");
	// 			return;
	// 		}

	// 		setFile(selectedFile);
	// 		setUploadStatus("idle");
	// 		setUploadMessage("");
	// 		setUploadResults(null);
	// 		setUploadProgress(0);
	// 	}
	// };

	// const handleCancelUpload = () => {
	// 	if (uploadAbortController.current) {
	// 		uploadAbortController.current.abort();
	// 		uploadAbortController.current = null;
	// 		setUploadStatus("cancelled");
	// 		setUploadMessage("Upload cancelled by user.");
	// 	}
	// };

	// const handleUpload = async () => {
	// 	if (!file) return;

	// 	const formData = new FormData();
	// 	formData.append("file", file);

	// 	// Create AbortController
	// 	uploadAbortController.current = new AbortController();

	// 	setUploadStatus("uploading");
	// 	setUploadProgress(0);
	// 	setUploadMessage("");
	// 	setUploadResults(null);

	// 	try {
	// 		const res = await api.post("/api/products/import_csv/", formData, {
	// 			headers: {
	// 				"Content-Type": "multipart/form-data",
	// 			},
	// 			signal: uploadAbortController.current.signal,
	// 			onUploadProgress: (progressEvent) => {
	// 				const percentCompleted = Math.round(
	// 					(progressEvent.loaded * 100) / (progressEvent.total || 1),
	// 				);
	// 				setUploadProgress(percentCompleted);
	// 			},
	// 		});

	// 		setUploadStatus("success");
	// 		setUploadResults(res.data);
	// 		setUploadMessage("Upload completed successfully.");
	// 		fetchProducts();
	// 	} catch (err: any) {
	// 		if (axios.isCancel(err)) {
	// 			console.log("Upload cancelled");
	// 			return; // State already handled in handleCancelUpload
	// 		}
	// 		setUploadStatus("error");
	// 		const msg = err.response?.data?.message || "Upload failed.";
	// 		setUploadMessage(msg);
	// 		if (err.response?.data?.errors) {
	// 			setUploadResults({ errors: err.response.data.errors });
	// 		}
	// 	} finally {
	// 		uploadAbortController.current = null;
	// 	}
	// };

	const handleDownload = async () => {
		try {
			const res = await api.get("/api/products/import_template/", {
				responseType: "blob",
			});
			const url = window.URL.createObjectURL(new Blob([res.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute(
				"download",
				`product_template_${new Date().toISOString().split("T")[0]}.csv`,
			);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			console.error("Download failed", err);
			toast.error("Download failed");
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold">{t("createProductPage.title")}</h1>

			{/* Tab Navigation */}
			<div className="flex border-b border-gray-300">
				<button
					type={"button"}
					className={`py-2 px-4 font-medium ${activeTab === "create" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
					onClick={() => setActiveTab("create")}
				>
					Create Single
				</button>
				<button
					type={"button"}
					className={`py-2 px-4 font-medium ${activeTab === "bulk" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
					onClick={() => setActiveTab("bulk")}
				>
					Bulk Import & template
				</button>
			</div>

			{/* Create Single Tab */}
			{activeTab === "create" && (
				<div className="flex flex-col gap-2 animate-fade-in">
					<div className="flex gap-2 flex-wrap w-full ">
						<div className="flex flex-1 flex-col w-full gap-2">
							<label htmlFor="name">{t("createProductPage.productName")}</label>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<input
										type="text"
										{...field}
										className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
										id="name"
									/>
								)}
							/>
							{errors.name && (
								<p className="text-red-500">{errors.name.message}</p>
							)}
						</div>
						<div className="flex flex-1 flex-col w-full gap-2">
							<label htmlFor="company">
								{" "}
								{t("createProductPage.companyName")}{" "}
							</label>
							<Controller
								name="company"
								control={control}
								render={({ field }) => (
									<input
										type="text"
										{...field}
										className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
										id="company"
									/>
								)}
							/>
							{errors.company && (
								<p className="text-red-500">{errors.company.message}</p>
							)}
						</div>
						<div className="flex flex-[0.5] flex-col w-full gap-2">
							<label htmlFor="unit"> {t("createProductPage.unit")} </label>
							<Controller
								name="unit_of_measurement"
								control={control}
								render={({ field }) => (
									<div className=" w-full ">
										<select
											id="unit"
											{...field}
											className="bg-[#B5C9DC] w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600"
										>
											<option value="" disabled hidden>
												{" "}
												Unit{" "}
											</option>
											{productUnits.map((unit) => (
												<option key={unit.id} value={unit.value}>
													{unit.name}
												</option>
											))}
										</select>
									</div>
								)}
							/>
							{errors.unit_of_measurement && (
								<p className="text-red-500">
									{errors.unit_of_measurement.message}
								</p>
							)}
						</div>
					</div>
					<div className="flex gap-4 flex-wrap w-full items-end">
						<div className="flex flex-col w-1/2 gap-2">
							<label htmlFor="remarks">
								{" "}
								{t("createProductPage.remarks")}{" "}
							</label>
							<Controller
								name="remarks"
								control={control}
								render={({ field }) => (
									<input
										type="text"
										{...field}
										onChange={(e) => field.onChange(e.target.value)}
										value={field.value}
										className=" bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
										id="remarks"
									/>
								)}
							/>
							{errors.remarks && (
								<p className="text-red-500">{errors.remarks.message}</p>
							)}
						</div>
					</div>

					<div className="flex mt-4">
						<button
							type="submit"
							disabled={isSubmitting}
							onClick={handleSubmit(onSubmit)}
							className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
						>
							{isSubmitting ? "Creating..." : "Create Product"}
						</button>
					</div>
				</div>
			)}

			{/* Bulk Import Tab */}
			{activeTab === "bulk" && (
				<div className="flex flex-col gap-6 animate-fade-in">
					{/* Actions Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Upload Card */}
						<ProductCsvImport />
						{/* Download Card */}
						<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
							<h2 className="text-lg font-semibold mb-4">Download Template</h2>
							<p className="text-gray-600 mb-6 text-sm">
								Download CSV format for uploading product list.
							</p>
							<button
								type={"button"}
								onClick={handleDownload}
								className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
							>
								Download template
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateProducts;
