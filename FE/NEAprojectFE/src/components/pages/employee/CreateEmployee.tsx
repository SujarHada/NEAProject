import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type CreateEmployeesFormData as createEmployeesInputs } from "app/schemas/employee"
import { FaChevronDown } from "react-icons/fa"
import { useParams, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
import api from "app/utils/api"
import axios from "axios"
import useDataStore from "app/store/useDataStore"
import { createEmployeesFormSchema } from "app/schemas/employee"
const CreateEmployee = () => {
    const params = useParams()
    const { t } = useTranslation()
    const { Branches: branches, getBranches } = useDataStore()

    useEffect(() => {
        getBranches();
    }, []);

    useEffect(() => {
        if (params.id && branches.length) {
            const branch = branches.find(b => b.organization_id === +params.id!);
            if (branch) {
                setValue("organization_id", branch.organization_id);
            }
        }
    }, [params.id, branches]);
    const createEmployeesFormschema = createEmployeesFormSchema(t)

    const { control, handleSubmit, formState: { isSubmitting, errors }, reset, setValue } = useForm<createEmployeesInputs>({
        defaultValues: {
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            password: "",
            organization_id: 0,
            role: "viewer",
        },
        resolver: zodResolver(createEmployeesFormschema),
        mode: "onSubmit"
    })
    const navigate = useNavigate()

    const onSubmit = async (data: createEmployeesInputs) => {
        try {

            const res = await api.post("/api/employees/", data)
            if (res.status === 201) {
                navigate("/employees/manage")
                reset()
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response) {
                    err.response.data.role.flat().forEach((err: string) => {
                        alert(err)
                    })
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
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("createEmployee.title")}</h1>

            <div className="flex flex-col lg:w-1/2 gap-2">
                <label htmlFor="organization_id">{t("createEmployee.labels.branchId")} *</label>
                <Controller
                    name="organization_id"
                    control={control}
                    render={({ field }) => (
                        <div className="flex w-full items-center relative">
                            <select id="position" {...field} onChange={(e) => field.onChange(+e.target.value)} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                <option value={0} disabled hidden>{t("createEmployee.placeholders.branches")}</option>
                                {
                                    branches.map((branch) => (
                                        <option key={branch.id} value={branch.organization_id}>{branch.name}</option>
                                    ))
                                }
                            </select>
                            <FaChevronDown className="absolute right-3 text-gray-500" />
                        </div>
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
                <div className="flex flex-row flex-1 gap-4 w-full flex-wrap">

                    <div className="flex flex-col w-full flex-1 ">
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
                    <div className="flex flex-col w-full flex-1 ">
                    <label htmlFor="email">{t("createEmployee.labels.password")} *</label>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <input type="password" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="password" />
                        )}
                    />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>
            </div>

            <div className="lg:w-1/2 flex flex-col relative">
                <label htmlFor="role">{t("createEmployee.labels.position")} *</label>
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <select id="role" {...field} className="bg-[#B5C9DC] w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                            <option value="" disabled hidden>{t("createEmployee.placeholders.position")}</option>
                            <option value="admin">Admin</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    )}
                />
                {errors.role && <p className="text-red-500">{errors.role.message}</p>}
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
