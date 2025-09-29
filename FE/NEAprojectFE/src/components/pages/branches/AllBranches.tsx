import { useState } from "react"
import branches from "../../../assets/branches.json"
import { useNavigate } from "react-router"
const AllBranches = () => {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const navigate = useNavigate()
    const toggleDropdown = (branchId: number) => {
        setOpenDropdownId(prev => (prev === branchId ? null : branchId))
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">All Branches</h1>

            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs  uppercase  bg-gray-700 text-gray-400 border-b">
                        <tr>
                            <th className="px-6 py-3">Id</th>
                            <th className="px-6 py-3">Branch name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            branches.length === 0 && (
                                <tr className="border-b bg-gray-800 border-gray-700">
                                    <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                        No Branches Found
                                    </td>
                                </tr>
                            )
                        }
                        {
                            branches.map((branch: any) => (
                                <tr
                                    key={branch.branchId}
                                    className="border-b bg-gray-800 border-gray-700"
                                >
                                    <td className="px-6 py-4 font-medium  text-white">
                                        {branch.branchId}
                                    </td>
                                    <td className="px-6 py-4">{branch.branchName}</td>
                                    <td className="px-6 py-4">{branch.email}</td>
                                    <td className="px-6 py-4">{branch.phone}</td>
                                    <td className="px-6 py-4">{branch.address}</td>
                                    <td className="px-6 py-4 relative">
                                        <button onClick={() => toggleDropdown(branch.branchId)}
                                            className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5  items-center"
                                        >
                                            ⋮
                                        </button>

                                        {openDropdownId === branch.branchId && (
                                            <div className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700">
                                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                    <li>
                                                        <button onClick={() => navigate(`/branches/${branch.branchId}/edit`)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            Edit
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button onClick={() => navigate(`/branches/${branch.branchId}/employee/create-employee`)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            Add employees
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button onClick={() => navigate(`/branches/${branch.branchId}/employee/all-employees`)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            All Employees
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

export default AllBranches
