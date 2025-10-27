import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type OfficeFormInputs } from "../../../interfaces/interfaces"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import api from "../../../utils/api"
import { createOfficeFormschema } from "../../../schemas/office"
const CreateOffice = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const createOfficeForm = createOfficeFormschema(t)

    const { control, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<OfficeFormInputs>({
        defaultValues: {
            name: "",
            email: "",
            address: "",
            phone_number: ""
        },
        resolver: zodResolver(createOfficeForm),
        mode: "onSubmit"
    })

    const onSubmit: SubmitHandler<OfficeFormInputs> = async (data) => {
        const res = await api.post("/api/offices/", data)
        if (res.status === 201) navigate("/offices/office-list")
        reset()
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("createOffice.title")}</h1>

            <div className="flex w-full flex-wrap gap-4">
                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="name">{t("createOffice.fields.name")} *</label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} id="name" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>

                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="address">{t("createOffice.fields.address")} *</label>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} id="address" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.address && <p className="text-red-500">{errors.address.message}</p>}
                </div>
            </div>

            <div className="flex w-full flex-wrap gap-4">
                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="email">{t("createOffice.fields.email")} *</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} id="email" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>

                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="phone_number">{t("createOffice.fields.phone")} *</label>
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} id="phone_number" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
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
                    {isSubmitting ? t("createOffice.buttons.creating") : t("createOffice.buttons.create")}
                </button>
            </div>
        </div>
    )
}

export default CreateOffice
