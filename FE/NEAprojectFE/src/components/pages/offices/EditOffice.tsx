import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type Office, type OfficeFormInputs } from "../../../interfaces/interfaces"
import axios from "axios"
import { useParams, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const EditOffice = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const params = useParams()
    const [office, setOffice] = useState<Office | null>(null)
    const [err, setErr] = useState<string | null>(null)

    const EditOfficeFormschema = z.object({
        name: z.string().min(1, t("editOffice.validation.name")),
        email: z.string().email({ message: t("editOffice.validation.emailInvalid") }).min(1, t("editOffice.validation.email")),
        address: z.string().min(1, t("editOffice.validation.address")),
        phone_number: z.string()
            .min(1, t("editOffice.validation.phone"))
            .regex(/^\d+$/, t("editOffice.validation.phoneNumber"))
            .max(10, t("editOffice.validation.phoneMax"))
    })

    const { control, handleSubmit, formState: { isSubmitting, errors }, setValue } = useForm<OfficeFormInputs>({
        defaultValues: {
            name: "",
            email: "",
            address: "",
            phone_number: ""
        },
        resolver: zodResolver(EditOfficeFormschema),
        mode: "onSubmit"
    })

    const fetchOffice = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/offices/${params.id}/`)
            setOffice(res.data)
        } catch (err: any) {
            setErr(err?.response?.data?.detail ?? t("editOffice.fetchError"))
        }
    }

    useEffect(() => {
        if (!office) {
            fetchOffice()
            return
        }
        setValue("name", office.name)
        setValue("email", office.email)
        setValue("address", office.address)
        setValue("phone_number", office.phone_number)
    }, [params, office, setValue])

    const onSubmit: SubmitHandler<OfficeFormInputs> = async (data) => {
        try {
            const res = await axios.put(`http://127.0.0.1:8000/api/offices/${params.id}/`, data)
            if (res.status === 200) navigate("/offices/office-list")
        } catch (error) {
            setErr(t("editOffice.updateError"))
        }
    }

    if (!office && !err) return <div>{t("editOffice.loading")}</div>
    if (err) return <div>{err}</div>

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("editOffice.title")}</h1>
            <div className="flex w-full flex-wrap gap-4">
                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="name">{t("editOffice.form.name")} *</label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="name" />
                        )}
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>

                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="address">{t("editOffice.form.address")} *</label>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="address" />
                        )}
                    />
                    {errors.address && <p className="text-red-500">{errors.address.message}</p>}
                </div>
            </div>

            <div className="flex w-full flex-wrap gap-4">
                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="email">{t("editOffice.form.email")} *</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="email" />
                        )}
                    />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>

                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="phone_number">{t("editOffice.form.phone")} *</label>
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="phone_number" />
                        )}
                    />
                    {errors.phone_number && <p className="text-red-500">{errors.phone_number.message}</p>}
                </div>
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? t("editOffice.saving") : t("editOffice.save")}
                </button>
            </div>
        </div>
    )
}

export default EditOffice
