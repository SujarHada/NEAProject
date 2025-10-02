import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { BranchFormInputs } from "../../../interfaces/interfaces"

const formSchema = z.object({
    orgId: z.string().min(1, "Organization ID is required for form"),
    branchName: z.string().min(1, "Branch Name is required"),
    email: z.email({ error: "Email is invalid" }).min(1, "Email is required"),
    address: z.string().min(1, "Address is required"),
    bankName: z.string().min(1, "Bank Name is required"),
    accName: z.string().min(1, "Account Name is required"),
    accNo: z.string().min(1, "Account Number is required"),
    phNo: z.string().min(1, "Phone No should be of length 10"),
})

const CreateBranches = () => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        reset,
    } = useForm<BranchFormInputs>({
        defaultValues: {
            orgId: "",
            branchName: "",
            email: "",
            address: "",
            bankName: "",
            accName: "",
            accNo: "",
            phNo: "",
        },
        resolver: zodResolver(formSchema),
        mode: "onSubmit"

    })
    useEffect(() => {
        console.log(isSubmitSuccessful, errors)
        if (isSubmitSuccessful) {
        } else {
            console.log(errors)
        }
    }, [isSubmitSuccessful, reset])
    const onSubmit: SubmitHandler<BranchFormInputs> = (data) => {
        console.log("Form Data:", data)
        reset({
            orgId: "",
            branchName: "",
            email: "",
            address: "",
            bankName: "",
            accName: "",
            accNo: "",
            phNo: "",
        }, {
            keepDefaultValues: true,
            keepErrors: false,
            keepDirty: false,
            keepIsSubmitted: false,
            keepTouched: false,
            keepIsValid: false,
            keepSubmitCount: false
        })
        console.log("Form submitted and reset")
    }

    return (
        <div
            className="flex flex-col gap-6"
        >
            <h1 className="text-2xl font-bold">Create Branch</h1>

            <div className="flex flex-col gap-2">
                <label htmlFor="orgId">Organization ID</label>
                <Controller
                    name="orgId"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            id="orgId"
                            type="text"
                            className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                        />
                    )}
                />
                {errors.orgId && <p className="text-red-500 text-sm">{errors.orgId.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="branchName">Branch Name</label>
                <Controller
                    name="branchName"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            id="branchName"
                            type="text"
                            className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                        />
                    )}
                />
                {errors.branchName && <p className="text-red-500 text-sm">{errors.branchName.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
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

            <div className="flex flex-col gap-2">
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

            <div className="flex flex-col gap-2">
                <label htmlFor="bankName">Bank Name</label>
                <Controller
                    name="bankName"
                    control={control}
                    render={({ field }) => (
                        <input
                            id="bankName"
                            type="text"
                            {...field}
                            className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                        />
                    )}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="accName">Account Name</label>
                <Controller
                    name="accName"
                    control={control}
                    render={({ field }) => (
                        <input
                            id="accName"
                            type="text"
                            {...field}
                            className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                        />
                    )} />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="accNo">Account Number</label>
                <Controller
                    name="accNo"
                    control={control}
                    render={({ field }) => (
                        <input
                            id="accNo"
                            type="text"
                            {...field}
                            className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                        />
                    )} />

                {errors.accNo && <p className="text-red-500 text-sm">{errors.accNo.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="phNo">Phone Number</label>
                <Controller
                    name="phNo"
                    control={control}
                    render={({ field }) => (
                        <input
                            id="phNo"
                            type="tel"
                            {...field}
                            className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                        />
                    )} />
                {errors.phNo && <p className="text-red-500 text-sm">{errors.phNo.message}</p>}
            </div>

            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Branch"}
                </button>
            </div>
        </div>
    )
}

export default CreateBranches
