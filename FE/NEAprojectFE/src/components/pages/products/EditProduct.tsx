import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "react-router"
import { FaChevronDown } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import type { Product, createProductInputs } from '../../../interfaces/interfaces'
import axios from 'axios'
import { useTranslation } from "react-i18next"
import api from '../../../utils/api'
import { updateProductFormschema } from '../../../schemas/product'

const EditProduct = () => {
    const { t } = useTranslation()
    const param = useParams()
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product>()
    const [err, setErr] = useState<string | null>(null)
    const fetchProduct = async () => {
        try {
            const res = await api.get(`/api/products/${param.id}/`)
            setProduct(res.data)
        } catch (err: any) {
            setErr(err?.response.data.detail)
        }
    }

    const editproductFormschema = updateProductFormschema(t)

    const { control, handleSubmit, formState: { isSubmitting, errors }, setValue } = useForm<createProductInputs>({
        defaultValues: { name: "", company: "", remarks: "", unit_of_measurement: "" },
        resolver: zodResolver(editproductFormschema),
        mode: "onSubmit"
    })

    useEffect(() => {
        if (!product) {
            fetchProduct()
            return
        }
        setValue("name", product.name)
        setValue("company", product.company)
        setValue("remarks", product.remarks)
        setValue("unit_of_measurement", product.unit_of_measurement)
    }, [param, product])

    const onSubmit = async (data: createProductInputs) => {
        try {
            const res = await api.put(`/api/products/${param.id}/`, data)
            if (res.status === 200) {
                navigate("/products/active-products")
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    alert(err.response.data.name[0])
                } else if (err.request) {
                    console.error("Network Error: Server not reachable")
                } else {
                    console.error("Axios Error:", err.message)
                }
            } else {
                console.error("Unexpected Error:", err)
            }
        }
    }



    if (!product && !err) return <div>{t("loading", { defaultValue: "Loading..." })}</div>
    if (err) return <div>{err}</div>

    return (
        <div className="flex flex-1 flex-col gap-6 ">
            <h1 className="text-2xl font-bold">{t("editProductPage.title")}</h1>

            <div className="flex gap-4 flex-wrap w-full ">
                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="name">{t("editProductPage.productName")}</label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="name" />
                        )}
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>

                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="company">{t("editProductPage.companyName")}</label>
                    <Controller
                        name="company"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="company" />
                        )}
                    />
                    {errors.company && <p className="text-red-500">{errors.company.message}</p>}
                </div>
            </div>

            <div className="flex gap-4 flex-wrap w-full items-end">
                <div className="flex flex-1 flex-col w-full min-w-[48.5%] gap-2">
                    <label htmlFor="remarks">{t("editProductPage.quantity")}</label>
                    <Controller
                        name="remarks"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} onChange={(e) => field.onChange(e.target.value)} value={field.value} className=" bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="quantity" />
                        )}
                    />
                    {errors.remarks && <p className="text-red-500">{errors.remarks.message}</p>}
                </div>

                <div className="flex flex-1 flex-col w-full min-w-[48.5%] gap-2 relative">
                    <Controller
                        name="unit_of_measurement"
                        control={control}
                        render={({ field }) => (
                            <div className=" w-full ">
                                <select id="unit" {...field} className="bg-[#B5C9DC] w-full appearance-none border-2 h-10 outline-none px-3 rounded-md border-gray-600" >
                                    <option value="" disabled hidden>{t("editProductPage.unit")}</option>
                                    <option value="kg">{t("editProductPage.units.kg")}</option>
                                    <option value="nos">{t("editProductPage.units.nos")}</option>
                                    <option value="set">{t("editProductPage.units.set")}</option>
                                    <option value="ltr">{t("editProductPage.units.ltr")}</option>
                                    <option value="pcs">{t("editProductPage.units.pcs")}</option>
                                </select>
                                <FaChevronDown className="absolute top-3 right-3 text-gray-500" />
                            </div>
                        )}
                    />
                    {errors.unit_of_measurement && <p className="text-red-500">{errors.unit_of_measurement.message}</p>}
                </div>
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? t("editProductPage.savingButton") : t("editProductPage.submitButton")}
                </button>
            </div>
        </div>
    )
}
export default EditProduct
