import { useRef, useState } from "react"
import type { Receiver } from "../../../interfaces/interfaces"
import Receivers from "../../../assets/receivers.json"
import { useOnClickOutside } from "usehooks-ts"

const ReceiverList = () => {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const ref = useRef(null)
    const toggleDropdown = (receiverId: number) => {
        setOpenDropdownId(prev => (prev === receiverId ? null : receiverId))
    }
    useOnClickOutside<any>(ref, () => {
        setOpenDropdownId(null)
    })
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Receivers List</h1>

            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs  uppercase  bg-gray-700 text-gray-400 border-b">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Post</th>
                            <th className="px-6 py-3">ID card No.</th>
                            <th className="px-6 py-3">Phone No.</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Receivers.length === 0 && (
                                <tr className="border-b bg-gray-800 border-gray-700">
                                    <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                        No Receivers found
                                    </td>
                                </tr>
                            )
                        }
                        {
                            Receivers.map((receiver: Receiver, index) => (
                                <tr
                                    key={index}
                                    className="border-b bg-gray-800 border-gray-700"
                                >
                                    <td className="px-6 py-4">{receiver.name}</td>
                                    <td className="px-6 py-4">{receiver.post}</td>
                                    <td className="px-6 py-4">{receiver.id}</td>
                                    <td className="px-6 py-4">{receiver.phoneNo}</td>
                                    <td className="px-6 py-4 relative">
                                        <button onClick={() => toggleDropdown(index)}
                                            className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5  items-center"
                                        >
                                            ⋮
                                        </button>

                                        {openDropdownId === index && (
                                            <div ref={ref} className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700">
                                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
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

export default ReceiverList
