import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import type { Branch, BranchFormInputs } from "../../../interfaces/interfaces"
import axios from "axios"
import { useNavigate, useParams } from "react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const EditBranch = () => {
    const { t } = useTranslation()
    const param = useParams()
    const navigate = useNavigate()
    const [branch, setBranch] = useState<Branch>()
    const [err, setErr] = useState<string | null>(null)

    const formSchema = z.object({
        name: z.string().min(1, t("editBranch.validation.name")),
        email: z.string().email({ message: t("editBranch.validation.emailInvalid") }).min(1, t("editBranch.validation.email")),
        address: z.string().min(1, t("editBranch.validation.address")),
        bank_name: z.string().min(1, t("editBranch.validation.bankName")),
        account_name: z.string().min(1, t("editBranch.validation.accountName")),
        account_number: z.string()
            .min(1, t("editBranch.validation.accountNumber"))
            .regex(/^\d+$/, t("editBranch.validation.accountNumberNum"))
            .max(15, t("editBranch.validation.accountNumberMax")),
        phone_number: z.string()
            .min(1, t("editBranch.validation.phone"))
            .regex(/^\d+$/, t("editBranch.validation.phoneNum"))
            .max(10, t("editBranch.validation.phoneMax"))
    })

    const { control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<BranchFormInputs>({
        defaultValues: {
            name: "",
            email: "",
            address: "",
            bank_name: "",
            account_name: "",
            account_number: "",
            phone_number: "",
        },
        resolver: zodResolver(formSchema),
        mode: "onSubmit"
    })

    const fetchBranch = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/branches/${param.id}/`)
            setBranch(res.data)
        } catch(err:any) {
            setErr(err?.response?.data?.detail)
        }
    }

    useEffect(() => {
        if (!branch) {
            fetchBranch()
            return
        }
        setValue("name", branch.name)
        setValue("email", branch.email)
        setValue("address", branch.address)
        setValue("bank_name", branch.bank_name)
        setValue("account_name", branch.account_name)
        setValue("account_number", branch.account_number)
        setValue("phone_number", branch.phone_number)
    }, [branch, param])

    const onSubmit: SubmitHandler<BranchFormInputs> = async (data) => {
        const res = await axios.put(`http://127.0.0.1:8000/api/branches/${param.id}/`, data)
        if(res.status === 200){
            navigate("/branches/all-branches")
        }
    }

    if(!branch && !err) return <div>{t("editBranch.loading")}</div>
    if(err) return <div>{err}</div>

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("editBranch.title")}</h1>

            <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="name">{t("editBranch.form.name")}</label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <input {...field} id="name" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="flex gap-4 flex-wrap w-full">
                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="email">{t("editBranch.form.email")}</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => <input {...field} id="email" type="email" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="address">{t("editBranch.form.address")}</label>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => <input {...field} id="address" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>
            </div>

            <div className="flex gap-4 flex-wrap w-full">
                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="bank_name">{t("editBranch.form.bankName")}</label>
                    <Controller
                        name="bank_name"
                        control={control}
                        render={({ field }) => <input {...field} id="bank_name" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.bank_name && <p className="text-red-500 text-sm">{errors.bank_name.message}</p>}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="account_name">{t("editBranch.form.accountName")}</label>
                    <Controller
                        name="account_name"
                        control={control}
                        render={({ field }) => <input {...field} id="account_name" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.account_name && <p className="text-red-500 text-sm">{errors.account_name.message}</p>}
                </div>
            </div>

            <div className="flex gap-4 flex-wrap w-full">
                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="account_number">{t("editBranch.form.accountNumber")}</label>
                    <Controller
                        name="account_number"
                        control={control}
                        render={({ field }) => <input {...field} id="account_number" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.account_number && <p className="text-red-500 text-sm">{errors.account_number.message}</p>}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="phone_number">{t("editBranch.form.phone")}</label>
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => <input {...field} id="phone_number" type="tel" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number.message}</p>}
                </div>
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? t("editBranch.saving") : t("editBranch.save")}
                </button>
            </div>
        </div>
    )
}

export default EditBranch
