import Products from '../../../assets/products.json'
import * as z from 'zod'
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams} from "react-router"
import { FaChevronDown } from 'react-icons/fa'
import { useEffect, useState } from 'react'
export interface Product {
    name: string
    SN: number
    SKU_ID: string
    companyName: string
    purchasePrice: number
    sellingPrice: number
    discountedPrice?: number | null
    unit: string
}

const EditProduct = () => {
    const param = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product>()
    useEffect(() => {
        if(!product){
            const editProduct = Products.find(product => product.SN === +param.id!)
            setProduct(editProduct)
            return
        }
        setValue("name", product.name)
        setValue("companyName", product.companyName)
        setValue("purchasePrice", product.purchasePrice)
        setValue("sellingPrice", product.sellingPrice)
        setValue("discountedPrice", product.discountedPrice)
        setValue("unit", product.unit)
    }, [param, product])
    interface ProductInputs {
        name: string
        companyName: string
        purchasePrice: number | null
        sellingPrice: number | null
        discountedPrice?: number | null
        unit: string
    }

    const createproductFormschema = z.object({
        name: z.string().min(1, "Products Name is required"),
        companyName: z.string().min(1, "Company Name is required"),
        purchasePrice: z.number().min(1, "Purchase Price is required").nullable(),
        sellingPrice: z.number().min(1, "Selling Price is required").nullable(),
        discountedPrice: z.number().optional().nullable(),
        unit: z.string().min(1, "Unit is required")
    })


    const { control, handleSubmit, formState: { isSubmitting, errors }, reset, setValue } = useForm<ProductInputs>(
        {
            defaultValues: {
                name: "",
                companyName: "",
                purchasePrice: null,
                sellingPrice: null,
                discountedPrice: null,
                unit: ""
            },
            resolver: zodResolver(createproductFormschema),
            mode: "onSubmit"
        }
    )

    const onSubmit = (data: ProductInputs) => {
        console.log(data)
        reset()
        navigate("/products/active-products")
    }



    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Create product</h1>
            <div className="flex gap-4 w-full">
                <div className="flex flex-col w-full gap-2">
                    <label htmlFor="name"> Producers Name * </label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="name" />
                        )}
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
                <div className="flex flex-col w-full gap-2">
                    <label htmlFor="companyName"> Company Name * </label>
                    <Controller
                        name="companyName"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="companyName" />
                        )}
                    />
                    {errors.companyName && <p className="text-red-500">{errors.companyName.message}</p>}
                </div>
            </div>
            <div className="flex w-full gap-4">

                <div className="w-full flex flex-col gap-2">
                    <label htmlFor="purchasePrice"> Purchase Price * </label>
                    <Controller
                        name="purchasePrice"
                        control={control}
                        render={({ field }) => (
                            <input type="number" name={field.name} ref={field.ref} onChange={(e) => field.onChange(Number(e.target.value))} value={field.value ?? ""} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="purchasePrice" />
                        )}
                    />
                    {errors.purchasePrice && <p className="text-red-500">{errors.purchasePrice.message}</p>}
                </div>
                <div className="w-full flex flex-col gap-2">
                    <label htmlFor="sellingPrice"> Selling Price * </label>
                    <Controller
                        name="sellingPrice"
                        control={control}
                        render={({ field }) => (
                            <input type="number" onChange={(e) => field.onChange(Number(e.target.value))} value={field.value ?? ""} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="sellingPrice" />
                        )}
                    />
                    {errors.sellingPrice && <p className="text-red-500">{errors.sellingPrice.message}</p>}
                </div>
                <div className="w-full flex flex-col gap-2 ">
                    <label htmlFor="discountedPrice"> Discounted Price </label>
                    <Controller
                        name="discountedPrice"
                        control={control}
                        render={({ field }) => (
                            <input type="number" onChange={(e) => field.onChange(Number(e.target.value))} value={field.value ?? ""} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="discountedPrice" />
                        )}
                    />
                    {errors.discountedPrice && <p className="text-red-500">{errors.discountedPrice.message}</p>}
                </div>
            </div>

            <div className="w-1/2 flex flex-col relative">
                <div className="flex ">
                    <Controller
                        name="unit"
                        control={control}
                        render={({ field }) => (
                            <div className="flex w-full items-center">
                                <select id="unit" {...field} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none  px-3 rounded-md border-gray-600" >
                                    <option value="" disabled hidden> Unit </option>
                                    <option value="kg">KG</option>
                                    <option value="nos">Nos.</option>
                                    <option value="set">Set</option>
                                    <option value="ltr">Ltr</option>
                                    <option value="pcs">Pcs.</option>
                                </select>
                                <FaChevronDown className="absolute right-3 text-gray-500" />
                            </div>

                        )}
                    />
                </div>
                <div className="flex ">
                    {errors.unit && <p className="text-red-500"> {errors.unit.message} </p>}
                </div>
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    )
}
export default EditProduct

