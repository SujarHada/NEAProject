import products from "../../../assets/products.json"
import type { Product } from "../../../interfaces/interfaces"
const ProductsBin = () => {
const goLive = (id:number)=>{
    console.log('Going live: ', id)
}
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Product Bin</h1>

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
                                        <button onClick={() => goLive(product.SN)}
                                            className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5  items-center"
                                        >
                                            Go Live
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ProductsBin
