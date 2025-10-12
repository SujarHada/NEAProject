import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type createEmployeesInputs } from "../../../interfaces/interfaces"
import { FaChevronDown } from "react-icons/fa"
import axios from "axios"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

const CreateEmployee = () => {
    const { t } = useTranslation()
    const createEmployeesFormschema = z.object({
        first_name: z.string().min(1, t("createEmployee.errors.firstName")),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, t("createEmployee.errors.lastName")),
        email: z.string().email(t("createEmployee.errors.emailInvalid")).min(1, t("createEmployee.errors.emailRequired")),
        organization_id: z.string().min(1, t("createEmployee.errors.branchId")),
        position: z.string().min(1, t("createEmployee.errors.position")),
    })

    const { control, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<createEmployeesInputs>({
        defaultValues: {
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            organization_id: "",
            position: "",
        },
        resolver: zodResolver(createEmployeesFormschema),
        mode: "onSubmit"
    })

    const navigate = useNavigate()

    const onSubmit = async (data: createEmployeesInputs) => {
        const res = await axios.post("http://127.0.0.1:8000/api/employees/", data)
        if(res.status === 201){
            navigate("/employees/manage")
            reset()
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("createEmployee.title")}</h1>

            <div className="flex flex-col lg:w-1/2 gap-2">
                <label htmlFor="organization_id">{t("createEmployee.labels.branchId")} *</label>
                <Controller
                    name="organization_id"
                    control={control}
                    render={({ field }) => (
                        <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="organization_id" />
                    )}
                />
                {errors.organization_id && <p className="text-red-500">{errors.organization_id.message}</p>}
            </div>

            <div className="flex w-full flex-wrap gap-4">
                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="first_name">{t("createEmployee.labels.firstName")} *</label>
                    <Controller
                        name="first_name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="first_name" />
                        )}
                    />
                    {errors.first_name && <p className="text-red-500">{errors.first_name.message}</p>}
                </div>

                <div className="w-full flex-1 flex flex-col gap-2">
                    <label htmlFor="middle_name">{t("createEmployee.labels.middleName")}</label>
                    <Controller
                        name="middle_name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="middle_name" />
                        )}
                    />
                    {errors.middle_name && <p className="text-red-500">{errors.middle_name.message}</p>}
                </div>

                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="last_name">{t("createEmployee.labels.lastName")} *</label>
                    <Controller
                        name="last_name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="last_name" />
                        )}
                    />
                    {errors.last_name && <p className="text-red-500">{errors.last_name.message}</p>}
                </div>
            </div>

            <div className="lg:w-1/2 flex flex-col gap-2">
                <label htmlFor="email">{t("createEmployee.labels.email")} *</label>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="email" />
                    )}
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>

            <div className="lg:w-1/2 flex flex-col relative">
                <label htmlFor="position">{t("createEmployee.labels.position")} *</label>
                <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                        <div className="flex w-full items-center relative">
                            <select id="position" {...field} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                <option value="" disabled hidden>{t("createEmployee.placeholders.position")}</option>
                                <option value="admin">{t("createEmployee.positions.admin")}</option>
                                <option value="accountant">{t("createEmployee.positions.accountant")}</option>
                                <option value="peon">{t("createEmployee.positions.peon")}</option>
                            </select>
                            <FaChevronDown className="absolute right-3 text-gray-500" />
                        </div>
                    )}
                />
                {errors.position && <p className="text-red-500">{errors.position.message}</p>}
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? t("createEmployee.button.creating") : t("createEmployee.button.create")}
                </button>
            </div>
        </div>
    )
}

export default CreateEmployee
