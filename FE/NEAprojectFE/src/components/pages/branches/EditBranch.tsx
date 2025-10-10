import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import type { Branch, BranchFormInputs } from "../../../interfaces/interfaces"
import axios from "axios"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
const formSchema = z.object({
    name: z.string().min(1, "Branch Name is required"),
    email: z.email({ error: "Email is invalid"}).min(1, "Email is required"),
    address: z.string().min(1, "Address is required"),
    bank_name: z.string().min(1, "Bank Name is required"),
    account_name: z.string().min(1, "Account Name is required"),
    account_number: z.string().min(1, "Account Number is required").regex(/^\d+$/, "Account Number must be a number").max(15, "Account Number must be 15 digits max"),
    phone_number: z.string().min(1, "Phone Number is required").regex(/^\d+$/, "Phone Number must be a number").max(10, "Phone Number must be 10 digits max"),
})

const EditBranch = () => {
    const param = useParams()
    const navigate = useNavigate()
        const [branch, setBranch] = useState<Branch>()
        const [err, setErr] = useState<string | null>(null)
        const fetchBranch = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/branches/${param.id}/`)
                setBranch(res.data)
            } catch(err:any) {
                setErr(err?.response.data.detail)
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
        }, [param, branch])
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting},
        setValue
    } = useForm<BranchFormInputs>({
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
    const onSubmit: SubmitHandler<BranchFormInputs> = async (data) => {
        const res = await axios.put(`http://127.0.0.1:8000/api/branches/${param.id}/`, data)
        if(res.status === 200){
            navigate("/branches/all-branches")
        }
    }
    if(!branch && !err) return <div>Loading...</div>
    if (err) {
        return <div>{err}</div>
    }
    return (
        <div
            className="flex flex-col gap-6"
        >
            <h1 className="text-2xl font-bold">Create Branch</h1>

            <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="name">Branch Name</label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            id="name"
                            type="text"
                            className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                        />
                    )}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="flex gap-4 flex-wrap w-full ">


                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="email">Email</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="email"
                                type="email"
                                {...field}
                                className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                            />
                        )}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="address">Address</label>
                    <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="address"
                                type="text"
                                {...field}
                                className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                            />
                        )}
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>
            </div>
            <div className="flex gap-4 flex-wrap w-full ">

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="bank_name">Bank Name</label>
                    <Controller
                        name="bank_name"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="bank_name"
                                type="text"
                                {...field}
                                className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                            />
                        )}
                    />
                    {errors.bank_name && <p className="text-red-500 text-sm">{errors.bank_name.message}</p>}

                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="account_name">Account Name</label>
                    <Controller
                        name="account_name"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="account_name"
                                type="text"
                                {...field}
                                className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                            />
                        )} />
                    {errors.account_name && <p className="text-red-500 text-sm">{errors.account_name.message}</p>}

                </div>
            </div>

            <div className="flex gap-4 flex-wrap w-full ">


                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="account_number">Account Number</label>
                    <Controller
                        name="account_number"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="account_number"
                                type="text"
                                {...field}
                                className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                            />
                        )} />

                    {errors.account_number && <p className="text-red-500 text-sm">{errors.account_number.message}</p>}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <label htmlFor="phone_number">Phone Number</label>
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="phone_number"
                                type="tel"
                                {...field}
                                className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                            />
                        )} />
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
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    )
}

export default EditBranch
