import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { createProductInputs, Product } from "app/interfaces/interfaces"
import axios from "axios"
import api from "app/utils/api"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { createProductFormschema } from "app/schemas/product"
import { productUnits } from "app/enum/productUnits"
import { useState, useEffect, useRef } from "react"

const CreateProducts = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    // Tab State
    const [activeTab, setActiveTab] = useState<'create' | 'bulk'>('create');

    // Bulk Upload State
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error' | 'cancelled'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadResults, setUploadResults] = useState<any>(null);
    const uploadAbortController = useRef<AbortController | null>(null);

    // Product List State
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Single Creation Form
    const createproductForm = createProductFormschema(t)
    const { control, handleSubmit, formState: { isSubmitting, errors } } = useForm<createProductInputs>(
        {
            defaultValues: {
                name: "",
                company: "",
                unit_of_measurement: "",
                remarks: ""
            },
            resolver: zodResolver(createproductForm),
            mode: "onChange"
        }
    )

    const onSubmit = async (data: createProductInputs) => {
        try {
            const res = await api.post("/api/products/", data)
            if (res.status === 201) {
                navigate("/products/active-products")
            }
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    alert(err.response.data.message)
                } else if (err.request) {
                    console.error("Network Error: Server not reachable")
                } else {
                    console.error("Axios Error:", err.message)
                }
            } else {
                console.error("Unexpected Error:", err)
            }
        }
    }

    // Bulk Functions
    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await api.get('/api/products/');
            setProducts(res.data.results || []);
        } catch (err) {
            console.error("Error fetching products", err);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'bulk') {
            fetchProducts();
        }
    }, [activeTab]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];

            // Validate Type
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
                alert("Please select a valid CSV file.");
                return;
            }

            // Validate Size (10MB Limit)
            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            if (selectedFile.size > MAX_FILE_SIZE) {
                alert("File size exceeds 10MB limit.");
                return;
            }

            setFile(selectedFile);
            setUploadStatus('idle');
            setUploadMessage('');
            setUploadResults(null);
            setUploadProgress(0);
        }
    };

    const handleCancelUpload = () => {
        if (uploadAbortController.current) {
            uploadAbortController.current.abort();
            uploadAbortController.current = null;
            setUploadStatus('cancelled');
            setUploadMessage('Upload cancelled by user.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        // Create AbortController
        uploadAbortController.current = new AbortController();

        setUploadStatus('uploading');
        setUploadProgress(0);
        setUploadMessage('');
        setUploadResults(null);

        try {
            const res = await api.post('/api/products/import_csv/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                signal: uploadAbortController.current.signal,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });

            setUploadStatus('success');
            setUploadResults(res.data);
            setUploadMessage("Upload completed successfully.");
            fetchProducts();
        } catch (err: any) {
            if (axios.isCancel(err)) {
                console.log('Upload cancelled');
                return; // State already handled in handleCancelUpload
            }
            setUploadStatus('error');
            const msg = err.response?.data?.message || "Upload failed.";
            setUploadMessage(msg);
            if (err.response?.data?.errors) {
                setUploadResults({ errors: err.response.data.errors });
            }
        } finally {
            uploadAbortController.current = null;
        }
    };

    const handleDownload = async () => {
        try {
            const res = await api.get('/api/products/export_csv/', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Download failed", err);
            alert("Download failed.");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{t("createProductPage.title")}</h1>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-300">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('create')}
                >
                    Create Single
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'bulk' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('bulk')}
                >
                    Bulk Import & List
                </button>
            </div>

            {/* Create Single Tab */}
            {activeTab === 'create' && (
                <div className="flex flex-col gap-2 animate-fade-in">
                    <div className="flex gap-2 flex-wrap w-full ">
                        <div className="flex flex-1 flex-col w-full gap-2">
                            <label htmlFor="name">{t('createProductPage.productName')}</label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="name" />
                                )}
                            />
                            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                        </div>
                        <div className="flex flex-1 flex-col w-full gap-2">
                            <label htmlFor="company"> {t('createProductPage.companyName')} </label>
                            <Controller
                                name="company"
                                control={control}
                                render={({ field }) => (
                                    <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="company" />
                                )}
                            />
                            {errors.company && <p className="text-red-500">{errors.company.message}</p>}
                        </div>
                        <div className="flex flex-[0.5] flex-col w-full gap-2">
                            <label htmlFor="unit"> {t('createProductPage.unit')} </label>
                            <Controller
                                name="unit_of_measurement"
                                control={control}
                                render={({ field }) => (
                                    <div className=" w-full ">
                                        <select id="unit" {...field} className="bg-[#B5C9DC] w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600" >
                                            <option value="" disabled hidden> Unit </option>
                                            {
                                                productUnits.map((unit) => (
                                                    <option key={unit.id} value={unit.value}>{unit.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}
                            />
                            {errors.unit_of_measurement && <p className="text-red-500">{errors.unit_of_measurement.message}</p>}
                        </div>
                    </div>
                    <div className="flex gap-4 flex-wrap w-full items-end">
                        <div className="flex flex-col w-1/2 gap-2">
                            <label htmlFor="remarks"> {t('createProductPage.remarks')} </label>
                            <Controller
                                name="remarks"
                                control={control}
                                render={({ field }) => (
                                    <input type="text" {...field} onChange={(e) => field.onChange(e.target.value)} value={field.value} className=" bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="remarks" />
                                )}
                            />
                            {errors.remarks && <p className="text-red-500">{errors.remarks.message}</p>}
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
            {activeTab === 'bulk' && (
                <div className="flex flex-col gap-6 animate-fade-in">

                    {/* Actions Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload Card */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Import Products (CSV)</h2>
                            <div className="flex flex-col gap-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                        <span className="text-gray-600 mb-2">
                                            {file ? file.name : "Click to select CSV file"}
                                        </span>
                                        <span className="text-xs text-gray-400">Supported format: .csv (Max 10MB)</span>
                                    </label>
                                </div>

                                {uploadStatus === 'uploading' && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}

                                {uploadMessage && (
                                    <div className={`text-sm ${uploadStatus === 'error' ? 'text-red-600' : uploadStatus === 'cancelled' ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {uploadMessage}
                                    </div>
                                )}

                                {uploadResults && uploadResults.errors && (
                                    <div className="bg-red-50 p-3 rounded text-xs text-red-600 max-h-32 overflow-y-auto">
                                        <ul>
                                            {uploadResults.errors.map((err: string, idx: number) => (
                                                <li key={idx}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {uploadResults && uploadResults.total_rows !== undefined && (
                                    <div className="text-xs text-gray-600">
                                        Total: {uploadResults.total_rows}, Success: {uploadResults.successful}, Failed: {uploadResults.failed}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || uploadStatus === 'uploading'}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'error' ? 'Retry Upload' : 'Upload CSV'}
                                    </button>

                                    {uploadStatus === 'uploading' && (
                                        <button
                                            onClick={handleCancelUpload}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Download Card */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Export Products</h2>
                            <p className="text-gray-600 mb-6 text-sm">Download the full list of products in CSV format.</p>
                            <button
                                onClick={handleDownload}
                                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                            >
                                Download CSV
                            </button>
                        </div>
                    </div>

                    {/* Recent Products List */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-700">Recent Products</h2>
                            <button onClick={fetchProducts} className="text-sm text-blue-600 hover:underline">Refresh</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">S.N.</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Company</th>
                                        <th className="px-6 py-3">Unit</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingProducts ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                                        </tr>
                                    ) : products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center">No products found</td>
                                        </tr>
                                    ) : (
                                        products.map((product, index) => (
                                            <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4">{index + 1}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                                <td className="px-6 py-4">{product.company}</td>
                                                <td className="px-6 py-4">{product.unit_of_measurement}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default CreateProducts
