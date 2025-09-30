import { useState } from "react"
import products from "../../../assets/products.json"
import { useNavigate } from "react-router"
import type { Product } from "./EditProduct"
const ActiveProducts = () => {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const navigate = useNavigate()
    const toggleDropdown = (productId: number) => {
        setOpenDropdownId(prev => (prev === productId ? null : productId))
    }

    const softDelete = (id:number)=>{
        console.log('The prodct to be deleted: ', id)
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Product List</h1>

            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs  uppercase  bg-gray-700 text-gray-400 border-b">
                        <tr>
                            <th className="px-6 py-3">S.N</th>
                            <th className="px-6 py-3">SKU Id</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Company</th>
                            <th className="px-6 py-3">Unit</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            products.length === 0 && (
                                <tr className="border-b bg-gray-800 border-gray-700">
                                    <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                        No Products Found
                                    </td>
                                </tr>
                            )
                        }
                        {
                            products.map((product: Product) => (
                                <tr
                                    key={product.SN}
                                    className="border-b bg-gray-800 border-gray-700"
                                >
                                    <td className="px-6 py-4 font-medium  text-white">
                                        {product.SN}
                                    </td>
                                    <td className="px-6 py-4">{product.SKU_ID}</td>
                                    <td className="px-6 py-4">{product.name}</td>
                                    <td className="px-6 py-4">{product.companyName}</td>
                                    <td className="px-6 py-4">{product.unit}</td>
                                    <td className="px-6 py-4 relative">
                                        <button onClick={() => toggleDropdown(product.SN)}
                                            className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5  items-center"
                                        >
                                            ⋮
                                        </button>

                                        {openDropdownId === product.SN && (
                                            <div className="absolute z-10 right-0 mt-2 w-44 divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700">
                                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                    <li>
                                                        <button onClick={() => navigate(`/products/edit/${product.SN}`)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                            Edit
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button onClick={() =>softDelete(product.SN)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
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

export default ActiveProducts
