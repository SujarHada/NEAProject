import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useOnClickOutside } from "usehooks-ts"
import type { Office } from "../../../interfaces/interfaces"
import axios from "axios"
const OfficeList = () => {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const navigate = useNavigate()
    const toggleDropdown = (officeId: number) => {
        setOpenDropdownId(prev => (prev === officeId ? null : officeId))
    }
    const ref = useRef(null)
    useOnClickOutside<any>(ref, () => {
        setOpenDropdownId(null)
    })

    const [offices, setOffices] = useState<Office[]>([])
    const fetchBranches = async () => {
        try {
            const res = await (await axios.get("http://127.0.0.1:8000/api/offices/")).data.results as Office[]
            setOffices(res)
        } catch (err) {
            console.error("Error fetching branches:", err)
        }
    }
    useEffect(() => {
        fetchBranches()
    }, [])
const handleDelete = async(id:number)=>{
    await axios.delete(`http://127.0.0.1:8000/api/offices/${id}/`)
    fetchBranches()
}
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Office List</h1>

                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs  uppercase  bg-gray-700 text-gray-400 border-b">
                        <tr>
                            <th className="px-6 py-3">Id</th>
                            <th className="px-6 py-3">Office name</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            offices.length === 0 && (
                                <tr className="border-b bg-gray-800 border-gray-700">
                                    <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                        No offices found
                                    </td>
                                </tr>
                            )
                        }
                        {
                            offices.map((office) => (
                                <tr
                                    key={office.id}
                                    className="border-b bg-gray-800 border-gray-700"
                                >
                                    <td className="px-6 py-4 font-medium  text-white">
                                        {office.id}
                                    </td>
                                    <td className="px-6 py-4">{office.name}</td>
                                    <td className="px-6 py-4">{office.address}</td>
                                    <td className="px-6 py-4">{office.email}</td>
                                    <td className="px-6 py-4">{office.phone_number}</td>
                                    <td className="px-6 py-4 relative">
                                        <button onClick={() => toggleDropdown(office.id)}
                                            className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5  items-center"
                                        >
                                            ⋮
                                        </button>

                                        {openDropdownId === office.id && (
                                            <div ref={ref} className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700">
                                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                    <li>
                                                        <button onClick={() => navigate(`/offices/edit/${office.id}`)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            Edit
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button onClick={() => handleDelete(office.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            Delete
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
    )
}

export default OfficeList
