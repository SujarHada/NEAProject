import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type createReceiverInputs, type Receiver } from "app/interfaces/interfaces"
import { useNavigate, useParams } from "react-router"
import { useTranslation } from "react-i18next"
import { FaChevronDown } from "react-icons/fa"
import { id_types } from "app/enum/id_types"
import { useEffect, useState } from "react"
import api from "app/utils/api"
import { updateReceiverSchema } from "app/schemas/receiver"
const EditReceiver = () => {
    const { t } = useTranslation()
    const param = useParams()
    const [receiver, setReceiver] = useState<Receiver>()
    const [err, setErr] = useState<string | null>(null)
    const navigate = useNavigate()
    const fetchReceiver = async () => {
        try {
            const res = await api.get(`/api/receivers/${param.id}/`)
            setReceiver(res.data)
        } catch (err: any) {
            setErr(err?.response.data.detail)
        }
    }

    const EditReceiversFormschema = updateReceiverSchema(t)
    const { control, handleSubmit, formState: { isSubmitting, errors }, setValue } = useForm<createReceiverInputs>(
        {
            resolver: zodResolver(EditReceiversFormschema),
            mode: "onSubmit"
        }
    )

    useEffect(() => {
        if (!receiver) {
            fetchReceiver()
            return
        }
        setValue("name", receiver.name)
        setValue("name", receiver.name)
        setValue("post", receiver.post)
        setValue("id_card_number", receiver.id_card_number)
        setValue("id_card_type", receiver.id_card_type)
        setValue("office_name", receiver.office_name)
        setValue("office_address", receiver.office_address)
        setValue("phone_number", receiver.phone_number)
        setValue("vehicle_number", receiver.vehicle_number)
    }, [param, receiver])



    const onSubmit: SubmitHandler<createReceiverInputs> = async (data) => {
        const res = await api.put(`/api/receivers/${param.id}/`, data)
        if (res.status === 200) {
            navigate("/receiver/receiver-list")
        }
    }

    if (!receiver && !err) return <div>{t("loading", { defaultValue: "Loading..." })}</div>
    if (err) return <div>{err}</div>


    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("editReceiver.title")}</h1>
            <div className="flex gap-4 w-full flex-wrap">
                <div className="flex flex-col flex-1 lg:w-1/2 gap-2">
                    <label htmlFor="name">{t("editReceiver.labels.name")} </label>
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
                    <label htmlFor="post"> {t("editReceiver.labels.post")} </label>
                    <Controller
                        name="post"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="post" />
                        )}
                    />
                    {errors.post && <p className="text-red-500">{errors.post.message}</p>}
                </div>
            </div>
            <div className="flex gap-4 w-full flex-wrap">
                <div className="w-full flex-1 flex flex-col gap-2">
                    <label htmlFor="id_card_number"> {t("editReceiver.labels.idNo")} </label>
                    <Controller
                        name="id_card_number"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="id_card_number" />
                        )}
                    />
                    {errors.id_card_number && <p className="text-red-500">{errors.id_card_number.message}</p>}
                </div>
                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="id_card_type"> {t("editReceiver.labels.idType")} </label>
                    <Controller
                        name="id_card_type"
                        control={control}
                        render={({ field }) => (
                            <div className="flex w-full items-center relative">
                                <select id="position" {...field} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                    {
                                        id_types.map((idType) => (
                                            <option key={idType.id} value={idType.value}>{idType.name}</option>
                                        ))
                                    }
                                </select>
                                <FaChevronDown className="absolute right-3 text-gray-500" />
                            </div>
                        )}
                    />
                    {errors.id_card_type && <p className="text-red-500">{errors.id_card_type.message}</p>}
                </div>
            </div>
            <div className="flex gap-4 w-full flex-wrap">
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="office_name"> {t("editReceiver.labels.deptName")} </label>
                    <Controller
                        name="office_name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="office_name" />
                        )}
                    />
                    {errors.office_name && <p className="text-red-500">{errors.office_name.message}</p>}
                </div>
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="office_address"> {t("editReceiver.labels.deptAddress")} </label>
                    <Controller
                        name="office_address"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="office_address" />
                        )}
                    />
                    {errors.office_address && <p className="text-red-500">{errors.office_address.message}</p>}
                </div>
            </div>
            <div className="flex gap-4 w-full flex-wrap">
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="phone_number"> {t("editReceiver.labels.phone")} </label>
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="phone_number" />
                        )}
                    />
                    {errors.phone_number && <p className="text-red-500">{errors.phone_number.message}</p>}
                </div>
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="vehicle_number"> {t("editReceiver.labels.vehicleNo")} </label>
                    <Controller
                        name="vehicle_number"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="vehicle_number" />
                        )}
                    />
                    {errors.vehicle_number && <p className="text-red-500">{errors.vehicle_number.message}</p>}
                </div>
            </div>
            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? t("editReceiver.labels.creating") : t("editReceiver.labels.createReceiver")}
                </button>
            </div>
        </div>
    )
}

export default EditReceiver
