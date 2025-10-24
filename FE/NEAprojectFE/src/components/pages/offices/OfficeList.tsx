import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Office } from "../../../interfaces/interfaces"
import axios from "axios"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useOnClickOutside } from 'usehooks-ts'
import { useTranslation } from 'react-i18next' // <-- for dynamic translation

const OfficeList = () => {
    const { t } = useTranslation()
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const [offices, setOffices] = useState<Office[]>([])
    const [officesCount, setOfficesCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [prevPage, setPrevPage] = useState<string | null>(null)
    const navigate = useNavigate()
    const ref = useRef(null)
    useOnClickOutside<any>(ref, () => {
        setOpenDropdownId(null)
    })

    const toggleDropdown = (id: number) => setOpenDropdownId(prev => (prev === id ? null : id))

    const fetchOffices = async (pageUrl?: string, pageNum?: number) => {
        try {
            const apiUrl = pageUrl || `http://127.0.0.1:8000/api/offices/?page=${pageNum || currentPage}`
            const res = await axios.get(apiUrl)
            setOffices(res.data.results)
            setOfficesCount(res.data.count)
            setNextPage(res.data.next)
            setPrevPage(res.data.previous)
            if (pageNum) setCurrentPage(pageNum)
        } catch (err: any) {
            if (err.response?.status === 404 && currentPage > 1) {
                await fetchOffices(undefined, currentPage - 1)
                return
            }
            console.error("Error fetching offices:", err)
        }
    }

    useEffect(() => {
        fetchOffices()
    }, [])

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/offices/${id}/`)
            fetchOffices()
        } catch (err) {
            console.error("Error deleting office:", err)
        }
    }

    const handleDownload = async () => {
        const res = await axios.get('http://127.0.0.1:8000/api/offices/export_csv/', {
            responseType: 'blob',
            params: {
                status: "active"
            }
        })

        const blob = new Blob([res.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `offices_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

    }


    const totalPages = Math.ceil(officesCount / 10)

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center" >
                <h1 className="text-2xl font-bold">{t('officeList.title')}</h1>
                <button onClick={handleDownload} className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5">
                    Download
                </button>
            </div>
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
                    <tr>
                        <th className="px-6 py-3">{t('officeList.table.id')}</th>
                        <th className="px-6 py-3">{t('officeList.table.name')}</th>
                        <th className="px-6 py-3">{t('officeList.table.address')}</th>
                        <th className="px-6 py-3">{t('officeList.table.email')}</th>
                        <th className="px-6 py-3">{t('officeList.table.contact')}</th>
                        <th className="px-6 py-3">{t('officeList.table.action')}</th>
                    </tr>
                </thead>
                <tbody>
                    {offices.length === 0 ? (
                        <tr className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                {t('officeList.noData')}
                            </td>
                        </tr>
                    ) : (
                        offices.map(office => (
                            <tr key={office.id} className="border-b bg-gray-800 border-gray-700">
                                <td className="px-6 py-4 font-medium text-white">{office.serial_number}</td>
                                <td className="px-6 py-4">{office.name}</td>
                                <td className="px-6 py-4">{office.address}</td>
                                <td className="px-6 py-4">{office.email}</td>
                                <td className="px-6 py-4">{office.phone_number}</td>
                                <td className="px-6 py-4 relative">
                                    <button onClick={() => toggleDropdown(office.id)} className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5">
                                        ⋮
                                    </button>
                                    {openDropdownId === office.id && (
                                        <div ref={ref} className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700">
                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                <li>
                                                    <button onClick={() => navigate(`/offices/edit/${office.id}`)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                        {t('officeList.actions.edit')}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button onClick={() => handleDelete(office.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                        {t('officeList.actions.delete')}
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {officesCount > 10 && (
                <ul className="flex items-center justify-center h-8 text-sm">
                    <li>
                        <button
                            onClick={() => prevPage && fetchOffices(prevPage, currentPage - 1)}
                            disabled={!prevPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-s-lg bg-gray-800 border-gray-700 ${prevPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                        >
                            <FaChevronLeft />
                        </button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i}>
                            <button
                                onClick={() => fetchOffices(undefined, i + 1)}
                                className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => nextPage && fetchOffices(nextPage, currentPage + 1)}
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

export default OfficeList
