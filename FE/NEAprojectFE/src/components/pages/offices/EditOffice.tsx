import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type Office, type OfficeFormInputs } from "../../../interfaces/interfaces"
import axios from "axios"
import { useParams } from "react-router"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
const EditOffice = () => {
    const navigate = useNavigate()
    const params = useParams()
    const [office, setOffice] = useState<Office | null>(null)
    const [err, setErr] = useState<string | null>(null)
    const EditOfficeFormschema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email({ error: "Email is invalid" }).min(1, "Email is required"),
        address: z.string().min(1, "Address is required"),
        phone_number: z.string().min(1, "Phone Number is required").regex(/^\d+$/, "Phone Number must be a number").max(10, "Phone Number must be 10 digits max"),
    })
    const fetchOffice = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/offices/${params.id}/`)
            setOffice(res.data)
        } catch (err: any) {
            setErr(err?.response.data.detail)
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
    }, [params, office])
    const { control, handleSubmit, formState: { isSubmitting, errors }, setValue } = useForm<OfficeFormInputs>(
        {
            defaultValues: {
                name: "",
                email: "",
                address: "",
                phone_number: ""
            },
            resolver: zodResolver(EditOfficeFormschema),
            mode: "onSubmit"
        }
    )

    const onSubmit: SubmitHandler<OfficeFormInputs> = async (data) => {
        const res = await axios.put(`http://127.0.0.1:8000/api/offices/${params.id}/`, data)
        if (res.status === 200) {
        navigate("/offices/office-list")
        }

    }
    if (!office && !err) return <div>Loading...</div>
    if (err) {
        return <div>{err}</div>
    }
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Edit Office</h1>
            <div className="flex  w-full flex-wrap gap-4">

                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="name"> Name * </label>
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
                    <label htmlFor="address"> Address * </label>
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
            <div className="flex  w-full flex-wrap gap-4">

                <div className="w-full flex flex-1 flex-col gap-2 ">
                    <label htmlFor="email"> Email * </label>
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
                    <label htmlFor="phone_number"> Phone Number * </label>
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
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    )
}

export default EditOffice
