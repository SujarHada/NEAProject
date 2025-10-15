import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type createEmployeesInputs, type Employee } from "../../../interfaces/interfaces"
import { FaChevronDown } from "react-icons/fa"
import axios from "axios"
import { useNavigate, useParams } from "react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { type Branch } from "../../../interfaces/interfaces"

const EditEmployee = () => {
    const { t } = useTranslation()
    const param = useParams()
    const [err, setErr] = useState<string | null>(null)
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [branches, setBranches] = useState<Branch[]>([])
    const fetchBranches = async () => {
        const response = await axios.get("http://127.0.0.1:8000/api/branches/")
        if (branches.length) return
        const fetchedBranches = response.data.results as Branch[]
        setBranches(fetchedBranches)
    }
    useEffect(() => {
        if (!branches.length) {
            fetchBranches()
        }
    }, [branches])
    useEffect(() => {
        if (param.id) {
            const branch = branches?.find((branch) => branch.organization_id === employee?.organization_id)
            if (branch) {
                setValue('organization_id', branch.organization_id)
            }
        }
    }, [param.id, branches, employee])
    const formSchema = z.object({
        first_name: z.string().min(1, t("editEmployee.errors.firstName")),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, t("editEmployee.errors.lastName")),
        email: z.string().email(t("editEmployee.errors.emailInvalid")).min(1, t("editEmployee.errors.emailRequired")),
        organization_id: z.string().min(1, t("editEmployee.errors.branchId")),
        role: z.string().min(1, t("editEmployee.errors.position")),
    })

    const { control, handleSubmit, formState: { isSubmitting, errors }, setValue, reset } = useForm<createEmployeesInputs>({
        defaultValues: {
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            organization_id: "",
            role: "",
        },
        resolver: zodResolver(formSchema),
        mode: "onSubmit"
    })

    const navigate = useNavigate()

    const fetchEmployee = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/employees/${param.id}/`)
            setEmployee(res.data)
        } catch (err: any) {
            setErr(err?.response?.data?.detail)
        }
    }

    useEffect(() => {
        if (!employee) {
            fetchEmployee()
            return
        }
        setValue("first_name", employee.first_name)
        setValue("middle_name", employee.middle_name)
        setValue("last_name", employee.last_name)
        setValue("email", employee.email)
        setValue("organization_id", employee.organization_id)
        setValue("role", employee.role)
    }, [param, employee])

    const onSubmit = async (data: createEmployeesInputs) => {
        const res = await axios.put(`http://127.0.0.1:8000/api/employees/${param.id}/`, data)
        if (res.status === 200) {
            navigate("/employees/manage")
            reset()
        }
    }

    if (!employee && !err) return <div>{t("editEmployee.loading")}</div>
    if (err) return <div>{err}</div>

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">{t("editEmployee.title")}</h1>

            <div className="flex flex-col lg:w-1/2 gap-2">
                <label htmlFor="organization_id">{t("editEmployee.labels.branchId")} *</label>
                <Controller
                    name="organization_id"
                    control={control}
                    render={({ field }) => (
                        <div className="flex w-full items-center relative">
                            <select id="position" {...field} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                <option value="" disabled hidden>{t("createEmployee.placeholders.branches")}</option>
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
                    <label htmlFor="first_name">{t("editEmployee.labels.firstName")} *</label>
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
                    <label htmlFor="middle_name">{t("editEmployee.labels.middleName")}</label>
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
                    <label htmlFor="last_name">{t("editEmployee.labels.lastName")} *</label>
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
                <label htmlFor="email">{t("editEmployee.labels.email")} *</label>
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
                <label htmlFor="role">{t("editEmployee.labels.position")} *</label>
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <div className="flex w-full items-center relative">
                            <select id="role" {...field} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                <option value="" disabled hidden>{t("editEmployee.placeholders.position")}</option>
                                <option value="admin">{t("editEmployee.positions.admin")}</option>
                                <option value="viewer">{t("editEmployee.positions.viewer")}</option>

                            </select>
                            <FaChevronDown className="absolute right-3 text-gray-500" />
                        </div>
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
                    {isSubmitting ? t("editEmployee.button.saving") : t("editEmployee.button.save")}
                </button>
            </div>
        </div>
    )
}

export default EditEmployee
