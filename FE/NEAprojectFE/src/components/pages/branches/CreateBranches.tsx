import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import type { BranchFormInputs } from "../../../interfaces/interfaces"
import api from "../../../utils/api"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

const CreateBranches = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const formSchema = z.object({
        name: z.string().min(1, t("createBranch.validation.name")),
        email: z.email({ message: t("createBranch.validation.emailInvalid") }).min(1, t("createBranch.validation.email")),
        address: z.string().min(1, t("createBranch.validation.address")),
        phone_number: z.string()
            .min(1, t("createBranch.validation.phone"))
            .regex(/^[\d\u0966-\u096F]{10}$/, t("createBranch.validation.phoneNum"))
            .max(10, t("createBranch.validation.phoneMax"))
    })

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<BranchFormInputs>({
        defaultValues: {
            name: "",
            email: "",
            address: "",
            phone_number: "",
        },
        resolver: zodResolver(formSchema),
        mode: "onSubmit"
    })

    const onSubmit: SubmitHandler<BranchFormInputs> = async (data) => {
        const res = await api.post("/api/branches/", data)
        if (res.status === 201) {
            navigate("/branches/all-branches")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("createBranch.title")}</h1>

            <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="name">{t("createBranch.form.name")}</label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <input {...field} id="name" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                    )}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="flex gap-4 flex-wrap w-full">
                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="email">{t("createBranch.form.email")}</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <input {...field} id="email" type="email" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="address">{t("createBranch.form.address")}</label>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <input {...field} id="address" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>
            </div>
            <div className="lg:w-1/2 flex flex-col gap-2">
                <label htmlFor="phone_number">{t("createBranch.form.phone")} *</label>
                <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                        <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="phone_number" />
                    )}
                />
                {errors.phone_number && <p className="text-red-500">{errors.phone_number.message}</p>}
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? t("createBranch.creating") : t("createBranch.create")}
                </button>
            </div>
        </div>
    )
}

export default CreateBranches
