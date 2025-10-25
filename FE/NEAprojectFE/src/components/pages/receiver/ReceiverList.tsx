import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Receiver } from "../../../interfaces/interfaces"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useOnClickOutside } from 'usehooks-ts'
import { useTranslation } from "react-i18next"
import api from "../../../utils/api"

const ReceiverList = () => {
    const { t } = useTranslation()
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const [receiversCount, setReceiversCount] = useState(0)
    const [receivers, setReceivers] = useState<Receiver[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [prevPage, setPrevPage] = useState<string | null>(null)
    const navigate = useNavigate()
    const ref = useRef(null)
    useOnClickOutside<any>(ref, () => setOpenDropdownId(null))

    const toggleDropdown = (receiverId: number) => {
        setOpenDropdownId(prev => (prev === receiverId ? null : receiverId))
    }

    const fetchreceivers = async (pageUrl?: string, pageNum?: number) => {
        try {
            const apiUrl = pageUrl || `/api/receivers/?page=${pageNum || currentPage}`
            const res = await api.get(apiUrl)
            setReceivers(res.data.results)
            setReceiversCount(res.data.count)
            setNextPage(res.data.next)
            setPrevPage(res.data.previous)
            if (pageNum) setCurrentPage(pageNum)
        } catch (err: any) {
            if (err.response?.status === 404 && currentPage > 1) {
                await fetchreceivers(undefined, currentPage - 1)
                return
            }
            console.error("Error fetching receivers:", err)
            return []
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/api/receivers/${id}/`)
            fetchreceivers()
        } catch (err) {
            console.error("Error deleting receiver:", err)
        }
    }
    useEffect(() => {
        fetchreceivers()
    }, [])

    const handleDownload = async () => {
        const res = await api.get('/api/receivers/export_csv/', {
            responseType: 'blob',
            params: {
                status: "active"
            }
        })
        const blob = new Blob([res.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `receivers_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

    }

    const totalPages = Math.ceil(receiversCount / 10)

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-bold">{t("allreceivers.title")}</h1>
                <button onClick={handleDownload} className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5">
                    Download
                </button>
            </div>
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
                    <tr>
                        <th className="px-6 py-3">{t("allreceivers.table.name")}</th>
                        <th className="px-6 py-3">{t("allreceivers.table.post")}</th>
                        <th className="px-6 py-3">{t("allreceivers.table.idcardNumber")}</th>
                        <th className="px-6 py-3">{t("allreceivers.table.phoneNumber")}</th>
                        <th className="px-6 py-3">{t("allreceivers.table.action")}</th>
                    </tr>
                </thead>
                <tbody>
                    {receivers.length === 0 && (
                        <tr className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                {t("allreceivers.noData")}
                            </td>
                        </tr>
                    )}
                    {receivers.map(receiver => (
                        <tr key={receiver.id} className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4">{receiver.name}</td>
                            <td className="px-6 py-4">{receiver.post}</td>
                            <td className="px-6 py-4">{receiver.id_card_number}</td>
                            <td className="px-6 py-4">{receiver.phone_number}</td>
                            <td className="px-6 py-4 relative">
                                <button onClick={() => toggleDropdown(receiver.id)}
                                    className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5">
                                    ⋮
                                </button>
                                {openDropdownId === receiver.id && (
                                    <div ref={ref} className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg bg-gray-700">
                                        <ul className="py-2 text-sm text-gray-200">
                                            <li>
                                                <button onClick={() => navigate(`/receiver/edit/${receiver.id}`)} className="block w-full text-left px-4 py-2 hover:bg-gray-600">
                                                    {t("allreceivers.actions.edit")}
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={() => handleDelete(receiver.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-600">
                                                    {t("allreceivers.actions.delete")}
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

            {receiversCount > 10 && (
                <ul className="flex items-center justify-center h-8 text-sm">
                    <li>
                        <button
                            onClick={() => prevPage && fetchreceivers(prevPage, currentPage - 1)}
                            disabled={!prevPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-s-lg bg-gray-800 border-gray-700 ${prevPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                        >
                            <FaChevronLeft />
                        </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i}>
                            <button
                                onClick={() => fetchreceivers(undefined, i + 1)}
                                className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={() => nextPage && fetchreceivers(nextPage, currentPage + 1)}
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

export default ReceiverList
