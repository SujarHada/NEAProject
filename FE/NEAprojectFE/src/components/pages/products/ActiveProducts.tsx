import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Product } from "../../../interfaces/interfaces"
import axios from "axios"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { useOnClickOutside } from 'usehooks-ts'

const ActiveProducts = () => {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [productsCount, setProductsCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [nextPage, setNextPage] = useState<string | null>(null)
    const [prevPage, setPrevPage] = useState<string | null>(null)
    const navigate = useNavigate()
    const ref = useRef(null)
    useOnClickOutside<any>(ref, () => {
        setOpenDropdownId(null)
    })

    const toggleDropdown = (productId: number) => {
        setOpenDropdownId(prev => (prev === productId ? null : productId))
    }

    const fetchProducts = async (pageUrl?: string, pageNum?: number) => {
        try {
            const apiUrl = pageUrl || `http://127.0.0.1:8000/api/products/?page=${pageNum || currentPage}`
            const res = await axios.get(apiUrl)

            setProducts(res.data.results)
            setProductsCount(res.data.count)
            setNextPage(res.data.next)
            setPrevPage(res.data.previous)

            if (pageNum) setCurrentPage(pageNum)
        } catch (err) {
            console.error("Error fetching products:", err)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const softDelete = async (id: number) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`)
            await fetchProducts()
            setOpenDropdownId(null)
        } catch (err) {
            console.error("Error deleting:", err)
        }
    }

    const totalPages = Math.ceil(productsCount / 10)

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-2xl font-bold">Product List</h1>

            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
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
                    {products.length === 0 ? (
                        <tr className="border-b bg-gray-800 border-gray-700">
                            <td className="px-6 py-4 font-medium text-center text-white" colSpan={6}>
                                No Products Found
                            </td>
                        </tr>
                    ) : (
                        products.map(product => (
                            <tr key={product.serial_number} className="border-b bg-gray-800 border-gray-700">
                                <td className="px-6 py-4 font-medium text-white">{product.serial_number}</td>
                                <td className="px-6 py-4">{product.sku}</td>
                                <td className="px-6 py-4">{product.name}</td>
                                <td className="px-6 py-4">{product.company}</td>
                                <td className="px-6 py-4">{product.unit_of_measurement}</td>
                                <td className="px-6 py-4 relative">
                                    <button
                                        onClick={() => toggleDropdown(product.serial_number)}
                                        className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
                                    >
                                        ⋮
                                    </button>

                                    {openDropdownId === product.serial_number && (
                                        <div
                                            ref={ref}
                                            className="absolute z-10 right-5 mt-2 w-44 rounded-lg shadow-lg dark:bg-gray-700"
                                            style={{
                                                transform: window.innerHeight - (window.scrollY + 200) < 150 ? "translateY(-100%)" : "none",
                                            }}
                                        >
                                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                                <li>
                                                    <button
                                                        onClick={() => navigate(`/products/edit/${product.id}`)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    >
                                                        Edit
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => softDelete(product.id)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    >
                                                        Move to bin
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

            {productsCount > 10 && (
                <ul className="flex items-center justify-center h-8 text-sm">
                    <li>
                        <button
                            onClick={() => prevPage && fetchProducts(prevPage, currentPage - 1)}
                            disabled={!prevPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-s-lg bg-gray-800 border-gray-700 ${prevPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            <FaChevronLeft />
                        </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i}>
                            <button
                                onClick={() => fetchProducts(undefined, i + 1)}
                                className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={() => nextPage && fetchProducts(nextPage, currentPage + 1)}
                            disabled={!nextPage}
                            className={`flex items-center justify-center px-3 h-8 border rounded-e-lg bg-gray-800 border-gray-700 ${nextPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"
                                }`}
                        >
                            <FaChevronRight />
                        </button>
                    </li>
                </ul>
            )}
        </div>
    )
}

export default ActiveProducts
