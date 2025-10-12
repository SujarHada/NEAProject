import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Branch } from "../../../interfaces/interfaces"
import axios from "axios"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useOnClickOutside } from 'usehooks-ts'
import { useTranslation } from "react-i18next"

const AllBranches = () => {
    const { t } = useTranslation()
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const [branchesCount, setBranchesCount] = useState(0)
    const [branches, setBranches] = useState<Branch[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [prevPage, setPrevPage] = useState<string | null>(null)
    const navigate = useNavigate()
    const ref = useRef(null)
    useOnClickOutside<any>(ref, () => setOpenDropdownId(null))

    const toggleDropdown = (branchId: number) => {
        setOpenDropdownId(prev => (prev === branchId ? null : branchId))
    }

    const fetchBranches = async (pageUrl?: string, pageNum?: number) => {
        try {
            const apiUrl = pageUrl || `http://127.0.0.1:8000/api/branches/?page=${pageNum || currentPage}`
            const res = await axios.get(apiUrl)
            setBranches(res.data.results)
            setBranchesCount(res.data.count)
            setNextPage(res.data.next)
            setPrevPage(res.data.previous)
            if (pageNum) setCurrentPage(pageNum)
        } catch (err: any) {
            if (err.response?.status === 404 && currentPage > 1) {
                await fetchBranches(undefined, currentPage - 1)
                return
            }
            console.error("Error fetching branches:", err)
            return []
        }
    }

    useEffect(() => {
        fetchBranches()
    }, [])

    const totalPages = Math.ceil(branchesCount / 10)

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold">{t("allBranches.title")}</h1>
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
                    <tr>
                        <th className="px-6 py-3">{t("allBranches.table.id")}</th>
                        <th className="px-6 py-3">{t("allBranches.table.name")}</th>
                        <th className="px-6 py-3">{t("allBranches.table.email")}</th>
                        <th className="px-6 py-3">{t("allBranches.table.phone")}</th>
                        <th className="px-6 py-3">{t("allBranches.table.address")}</th>
                        <th className="px-6 py-3">{t("allBranches.table.action")}</th>
                    </tr>
                </thead>
                <tbody>
                    {branches.length === 0 && (
                        <tr className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                {t("allBranches.noBranches")}
                            </td>
                        </tr>
                    )}
                    {branches.map(branch => (
                        <tr key={branch.id} className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4 font-medium text-white">{branch.serial_number}</td>
                            <td className="px-6 py-4">{branch.name}</td>
                            <td className="px-6 py-4">{branch.email}</td>
                            <td className="px-6 py-4">{branch.phone_number}</td>
                            <td className="px-6 py-4">{branch.address}</td>
                            <td className="px-6 py-4 relative">
                                <button onClick={() => toggleDropdown(branch.id)}
                                    className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5">
                                    ⋮
                                </button>
                                {openDropdownId === branch.id && (
                                    <div ref={ref} className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg bg-gray-700">
                                        <ul className="py-2 text-sm text-gray-200">
                                            <li>
                                                <button onClick={() => navigate(`/branches/${branch.id}/edit`)} className="block w-full text-left px-4 py-2 hover:bg-gray-600">
                                                    {t("allBranches.actions.edit")}
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={() => navigate(`/branches/${branch.id}/employee/create-employee`)} className="block w-full text-left px-4 py-2 hover:bg-gray-600">
                                                    {t("allBranches.actions.addEmployees")}
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={() => navigate(`/branches/${branch.id}/employee/all-employees`)} className="block w-full text-left px-4 py-2 hover:bg-gray-600">
                                                    {t("allBranches.actions.allEmployees")}
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

            {branchesCount > 10 && (
                <ul className="flex items-center justify-center h-8 text-sm">
                    <li>
                        <button
                            onClick={() => prevPage && fetchBranches(prevPage, currentPage - 1)}
                            disabled={!prevPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-s-lg bg-gray-800 border-gray-700 ${prevPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                        >
                            <FaChevronLeft />
                        </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i}>
                            <button
                                onClick={() => fetchBranches(undefined, i + 1)}
                                className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={() => nextPage && fetchBranches(nextPage, currentPage + 1)}
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

export default AllBranches
