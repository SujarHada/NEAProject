import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Employee } from "../../../interfaces/interfaces"
import axios from "axios"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useOnClickOutside } from 'usehooks-ts'
import { useTranslation } from "react-i18next"

const AllEmployees = () => {
    const { t } = useTranslation()
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const [employeesCount, setEmployeesCount] = useState(0)
    const [employees, setEmployees] = useState<Employee[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [prevPage, setPrevPage] = useState<string | null>(null)
    const navigate = useNavigate()
    const ref = useRef(null)
    useOnClickOutside<any>(ref, () => setOpenDropdownId(null))

    const toggleDropdown = (employeeId: number) => {
        setOpenDropdownId(prev => (prev === employeeId ? null : employeeId))
    }

    const fetchEmployees = async (pageUrl?: string, pageNum?: number) => {
        try {
            const apiUrl = pageUrl || `http://127.0.0.1:8000/api/employees/?page=${pageNum || currentPage}`
            const res = await axios.get(apiUrl)
            setEmployees(res.data.results)
            setEmployeesCount(res.data.count)
            setNextPage(res.data.next)
            setPrevPage(res.data.previous)
            if (pageNum) setCurrentPage(pageNum)
        } catch (err: any) {
            if (err.response?.status === 404 && currentPage > 1) {
                await fetchEmployees(undefined, currentPage - 1)
                return
            }
            console.error("Error fetching employees:", err)
            return []
        }
    }

    useEffect(() => { fetchEmployees() }, [])

    const totalPages = Math.ceil(employeesCount / 10)

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold">{t("allEmployees.title")}</h1>

            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
                    <tr>
                        <th className="px-6 py-3">{t("allEmployees.headers.id")}</th>
                        <th className="px-6 py-3">{t("allEmployees.headers.name")}</th>
                        <th className="px-6 py-3">{t("allEmployees.headers.email")}</th>
                        <th className="px-6 py-3">{t("allEmployees.headers.role")}</th>
                        <th className="px-6 py-3">{t("allEmployees.headers.branch")}</th>
                        <th className="px-6 py-3">{t("allEmployees.headers.action")}</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.length === 0 && (
                        <tr className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                {t("allEmployees.noData")}
                            </td>
                        </tr>
                    )}

                    {employees.map((employee) => (
                        <tr key={employee.id} className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4">{employee.serial_number}</td>
                            <td className="px-6 py-4">{employee.first_name} {employee?.middle_name} {employee.last_name}</td>
                            <td className="px-6 py-4">{employee.email}</td>
                            <td className="px-6 py-4">{employee.position}</td>
                            <td className="px-6 py-4">{employee.branch_name}</td>
                            <td className="px-6 py-4 relative">
                                <button
                                    onClick={() => toggleDropdown(employee.id)}
                                    className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5 items-center"
                                >
                                    ⋮
                                </button>
                                {openDropdownId === employee.id && (
                                    <div ref={ref} className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700">
                                        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                            <li>
                                                <button onClick={() => navigate(`/employees/edit/${employee.id}`)}
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                    {t("allEmployees.edit")}
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

            {employeesCount > 10 && (
                <ul className="flex items-center justify-center h-8 text-sm">
                    <li>
                        <button
                            onClick={() => prevPage && fetchEmployees(prevPage, currentPage - 1)}
                            disabled={!prevPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-s-lg bg-gray-800 border-gray-700 ${prevPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
                        >
                            <FaChevronLeft />
                        </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i}>
                            <button
                                onClick={() => fetchEmployees(undefined, i + 1)}
                                className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={() => nextPage && fetchEmployees(nextPage, currentPage + 1)}
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

export default AllEmployees
