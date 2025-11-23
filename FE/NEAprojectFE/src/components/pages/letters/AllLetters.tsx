import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Letter } from "app/interfaces/interfaces"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useOnClickOutside } from 'usehooks-ts'
import { useTranslation } from "react-i18next"
import api from "app/utils/api"
import NepaliDatePicker, { NepaliDate } from "@zener/nepali-datepicker-react"

const AllLetters = () => {
    const { t } = useTranslation()
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const [letterCount, setLetterCount] = useState(0)
    const [letters, setLetters] = useState<Letter[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [prevPage, setPrevPage] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<NepaliDate | null>(null)
    const [endDate, setEndDate] = useState<NepaliDate | null>(null)

    const navigate = useNavigate()
    const ref = useRef(null)
    useOnClickOutside<any>(ref, () => setOpenDropdownId(null))

    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)

    const toggleDropdown = (branchId: number, e?: React.MouseEvent) => {
        if (openDropdownId === branchId) {
            setOpenDropdownId(null)
            return
        }

        const rect = (e?.currentTarget as HTMLElement)?.getBoundingClientRect()
        setDropdownPosition({
            top: rect.bottom + window.scrollY + 5,
            left: rect.right - 180,
        })
        setOpenDropdownId(branchId)
    }


    const fetchLetters = async (options?: {
        page?: number;
        url?: string;
        start?: string;
        end?: string;
    }) => {
        try {
            const { page, url, start, end } = options || {};

            const apiUrl =
                url ||
                (start && end
                    ? "/api/letters/by-date-range/"
                    : `/api/letters/?page=${page || currentPage}`);

            const params: any = {};

            if (start && end) {
                params.start_date = start;
                params.end_date = end;
            } else {
                params.status = "draft";
            }

            const res = await api.get(apiUrl, { params });

            const result = res.data.results?.data || [];

            setLetters(result);
            setLetterCount(res.data.count);
            setNextPage(res.data.next);
            setPrevPage(res.data.previous);

            if (page) setCurrentPage(page);
        } catch (err: any) {
            if (err.response?.status === 404 && currentPage > 1) {
                // fallback to previous page
                await fetchLetters({ page: currentPage - 1 });
                return;
            }
            console.error("Error fetching letters:", err);
        }
    };


    useEffect(() => {
        if (startDate && endDate) {
            fetchLetters({
                start: startDate.format("YYYY-MM-DD"),
                end: endDate.format("YYYY-MM-DD")
            });
        }else{
            fetchLetters();
        }
    }, [startDate, endDate]);


    useEffect(() => {
        fetchLetters();
    }, []);


    const handleDelete = async (letterId: number) => {
        try {
            const res = await api.delete(`/api/letters/${letterId}/`)
            if (res.status === 200) {
                await fetchLetters()
                setOpenDropdownId(null)

            }
        } catch (err) {
            console.error("Error deleting letter:", err)
        }
    }


    const handleDownload = async () => {
        try {
            let res;

            const isRangeSelected = startDate && endDate;

            if (!isRangeSelected) {
                res = await api.get('/api/letters/export_xlsx/', {
                    responseType: 'blob',
                });
            } else {
                res = await api.post(
                    '/api/letters/export_xlsx_by_date/',
                    {
                        start_date: startDate.format("YYYY-MM-DD"),
                        end_date: endDate.format("YYYY-MM-DD"),
                    },
                    {
                        responseType: 'blob',
                    }
                );
            }

            if (!res || !res.data) {
                throw new Error("Empty server response");
            }

            // detect file type properly
            const contentType = res.headers["content-type"] || "application/octet-stream";
            const extension =
                contentType.includes("excel") || contentType.includes("spreadsheet")
                    ? "xlsx"
                    : "csv";

            const blob = new Blob([res.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `letters_${new Date().toISOString()}.${extension}`;
            document.body.appendChild(link);

            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error("Download error:", err);

            const msg = err.message.includes('404') ? 'Data not found' :
                "Something went wrong while downloading.";

            alert(`${msg}`);
        }
    };


    const totalPages = Math.ceil(letterCount / 10)

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold">{t("allletters.title")}</h1>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-[50%]">
                    <NepaliDatePicker
                        value={startDate}
                        onChange={setStartDate}
                        className="flex-1 border-2 pl-3 rounded-md w-full"
                        placeholder="Select starting date"
                    />

                    <NepaliDatePicker
                        value={endDate}
                        onChange={setEndDate}
                        className="flex-1 border-2 pl-3 rounded-md w-full"
                        placeholder="Select ending date"
                    />

                    <button
                        onClick={handleDownload}
                        className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5 w-full sm:w-auto"
                    >
                        Download
                    </button>
                </div>
            </div>

            <div className="w-full  overflow-x-auto overflow-y-visible" style={{ scrollbarWidth: 'thin' }} >

                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
                        <tr>
                            <th className="px-6 py-3" >{t("allletters.table.receiver_office_name")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.voucher_no")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.chalani_no")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.gatepass_no")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.request_date")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.receiver_name")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.receiver_id_card_number")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.receiver_phone_number")}</th>
                            <th className="px-6 py-3" >{t("allletters.table.action")}</th>
                        </tr>
                    </thead>
                    <tbody className="relative " >
                        {letters?.length === 0 && (
                            <tr className="border-b w-full bg-gray-800 border-gray-700">
                                <td className="px-6 py-4 font-medium text-center text-white" colSpan={10}>
                                    {t("allletters.noletters")}
                                </td>
                            </tr>
                        )}
                        {letters?.map(letter => (
                            <tr key={letter.id} className="border-b bg-gray-800 border-gray-700">
                                <td className="px-6 py-4 font-medium text-white">{letter.office_name}</td>
                                <td className="px-6 py-4">{letter.voucher_no}</td>
                                <td className="px-6 py-4">{letter.chalani_no}</td>
                                <td className="px-6 py-4">{letter.gatepass_no}</td>
                                <td className="px-6 py-4">{letter.request_date}</td>
                                <td className="px-6 py-4">{letter.receiver.name}</td>
                                <td className="px-6 py-4">{letter.receiver.id_card_number}</td>
                                <td className="px-6 py-4">{letter.receiver.phone_number}</td>
                                <td className="px-6 py-4 ">
                                    <button
                                        onClick={(e) => toggleDropdown(letter.id, e)}
                                        className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                                    >
                                        ⋮
                                    </button>
                                    {openDropdownId === letter.id && (
                                        <div
                                            ref={ref}
                                            className="fixed z-[99999] w-44 divide-y divide-gray-100 rounded-lg shadow-lg bg-gray-700"
                                            style={{
                                                top: dropdownPosition?.top ?? 0,
                                                left: dropdownPosition?.left ?? 0,
                                            }}
                                        >
                                            <ul className="py-2 text-sm text-gray-200">
                                                <li>
                                                    <button
                                                        onClick={() => navigate(`/letters/${letter.id}/edit`)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        {t("allletters.actions.edit")}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => handleDelete(letter.id)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        {t("allletters.actions.delete")}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => navigate(`/letters/view-letter/${letter.id}`)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        {t("allletters.actions.view")}
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {letterCount > 10 && (
                <ul className="flex items-center justify-center h-8 text-sm">
                    <li>
                        <button
                            onClick={() => prevPage && fetchLetters({ url: prevPage, page: currentPage - 1 })}
                            disabled={!prevPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-s-lg bg-gray-800 border-gray-700 ${prevPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                        >
                            <FaChevronLeft />
                        </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i}>
                            <button
                                onClick={() => fetchLetters({ url: undefined, page: i + 1 })}
                                className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={() => nextPage && fetchLetters({ url: nextPage, page: currentPage + 1 })}
                            disabled={!nextPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-e-lg bg-gray-800 border-gray-700 ${nextPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                        >
                            <FaChevronRight />
                        </button>
                    </li>
                </ul>
            )}
        </div>
    )
}

export default AllLetters
