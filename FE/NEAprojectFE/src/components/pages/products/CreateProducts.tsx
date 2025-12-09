import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { createProductInputs } from "app/interfaces/interfaces"
import axios from "axios"
import api from "app/utils/api"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { createProductFormschema } from "app/schemas/product"
import { productUnits } from "app/enum/productUnits"

const CreateProducts = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const createproductForm = createProductFormschema(t)

    const { control, handleSubmit, formState: { isSubmitting, errors } } = useForm<createProductInputs>(
        {
            defaultValues: {
                name: "",
                company: "",
                unit_of_measurement: "",
                remarks: ""
            },
            resolver: zodResolver(createproductForm),
            mode: "onChange"
        }
    )


    const onSubmit = async (data: createProductInputs) => {
        try {
            const res = await api.post("/api/products/", data)
            if (res.status === 201) {
                navigate("/products/active-products")
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    alert(err.response.data.message)
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

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{t("createProductPage.title")}</h1>
            <div className="flex gap-2 flex-wrap w-full ">
                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="name">{t('createProductPage.productName')}</label>
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
                    <label htmlFor="company"> {t('createProductPage.companyName')} </label>
                    <Controller
                        name="company"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="company" />
                        )}
                    />
                    {errors.company && <p className="text-red-500">{errors.company.message}</p>}
                </div>
                 <div className="flex flex-[0.5] flex-col w-full gap-2">
                     <label htmlFor="company"> {t('createProductPage.unit')} </label>
                    <Controller
                        name="unit_of_measurement"
                        control={control}
                        render={({ field }) => (
                            <div className=" w-full ">
                                <select id="unit" {...field} className="bg-[#B5C9DC] w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600" >
                                    <option value="" disabled hidden> Unit </option>
                                    {
                                        productUnits.map((unit) => (
                                            <option key={unit.id} value={unit.value}>{unit.name}</option>
                                        ))
                                    }
                                </select>
                            </div>

                        )}
                    />
                    {errors.unit_of_measurement && <p className="text-red-500">{errors.unit_of_measurement.message}</p>}
                </div>
            </div>
            <div className="flex gap-4 flex-wrap w-full items-end">
                <div className="flex flex-col w-1/2 gap-2">
                    <label htmlFor="remarks"> {t('createProductPage.remarks')} </label>
                    <Controller
                        name="remarks"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} onChange={(e) => field.onChange(e.target.value)} value={field.value} className=" bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="remarks" />
                        )}
                    />
                    {errors.remarks && <p className="text-red-500">{errors.remarks.message}</p>}
                </div>
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Product"}
                </button>
            </div>
        </div>
    )
}

export default CreateProducts
