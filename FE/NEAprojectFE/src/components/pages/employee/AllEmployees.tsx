import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Employee } from "../../../interfaces/interfaces"
import Employees from "../../../assets/employees.json"
import { useOnClickOutside } from "usehooks-ts"

const AllEmployees = () => {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const navigate = useNavigate()
    const ref = useRef(null)
    const toggleDropdown = (employeeId: number) => {
        setOpenDropdownId(prev => (prev === employeeId ? null : employeeId))
    }
    useOnClickOutside<any>(ref, () => {
        setOpenDropdownId(null)
    })
    const softDelete = (id: number) => {
        console.log('The employee to be deleted: ', id)
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Employee List</h1>

            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs  uppercase  bg-gray-700 text-gray-400 border-b">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Branch</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Employees.length === 0 && (
                                <tr className="border-b bg-gray-800 border-gray-700">
                                    <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                        No employees found
                                    </td>
                                </tr>
                            )
                        }
                        {
                            Employees.map((employee: Employee, index) => (
                                <tr
                                    key={index}
                                    className="border-b bg-gray-800 border-gray-700"
                                >
                                    <td className="px-6 py-4">{employee.name}</td>
                                    <td className="px-6 py-4">{employee.email}</td>
                                    <td className="px-6 py-4">{employee.role}</td>
                                    <td className="px-6 py-4">{employee.branch}</td>
                                    <td className="px-6 py-4 relative">
                                        <button onClick={() => toggleDropdown(index)}
                                            className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5  items-center"
                                        >
                                            ⋮
                                        </button>

                                        {openDropdownId === index && (
                                            <div ref={ref} className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700">
                                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                    <li>
                                                        <button onClick={() => navigate(`/employees/edit/${index}`)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            Edit
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button onClick={() => softDelete(index)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            Move to bin
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
        </div>
    )
}

export default AllEmployees
