import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { FaChevronDown } from "react-icons/fa"
import type { createProductInputs } from "../../../interfaces/interfaces"
import axios from "axios"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"




const CreateProducts = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const createproductFormschema = z.object({
        name: z.string().min(1, t("editProductPage.errors.productNameRequired")),
        company: z.string().min(1, t("editProductPage.errors.companyNameRequired")),
        unit_of_measurement: z.string().min(1, t("editProductPage.errors.unitRequired")),
        remarks: z.string().optional(),
    })

    const { control, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<createProductInputs>(
        {
            defaultValues: {
                name: "",
                company: "",
                unit_of_measurement: "",
                remarks: ""
            },
            resolver: zodResolver(createproductFormschema),
            mode: "onChange"
        }
    )

    const onSubmit = async (data: createProductInputs) => {
        const res = await axios.post("http://127.0.0.1:8000/api/products/", data)
        if (res.status === 201) {
            navigate("/products/active-products")
        }

        reset()
    }
    return (
        <div className="  flex-col gap-6 ">
            <h1 className="text-2xl font-bold">{t("createProductPage.title")}</h1>
            <div className="flex gap-4 flex-wrap w-full ">
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
            </div>
            <div className="flex gap-4 flex-wrap w-full items-end">
                <div className="flex flex-1 flex-col w-full min-w-[48.5%] gap-2">
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

                <div className="flex flex-1 flex-col w-full min-w-[48.5%] gap-2 relative">
                    <Controller
                        name="unit_of_measurement"
                        control={control}
                        render={({ field }) => (
                            <div className=" w-full ">
                                <select id="unit" {...field} className="bg-[#B5C9DC] w-full appearance-none  border-2 h-10 outline-none px-3 rounded-md border-gray-600" >
                                    <option value="" disabled hidden> Unit </option>
                                    <option value="kg">{t("createProductPage.units.kg")}</option>
                                    <option value="nos">{t("createProductPage.units.nos")}</option>
                                    <option value="set"> {t("createProductPage.units.set")} </option>
                                    <option value="ltr">{t("createProductPage.units.ltr")} </option>
                                    <option value="pcs">{t("createProductPage.units.pcs")}</option>

                                </select>
                                <FaChevronDown className="absolute top-3  right-3 text-gray-500" />
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
                    {isSubmitting ? "Creating..." : "Create Product"}
                </button>
            </div>
        </div>
    )
}

export default CreateProducts
