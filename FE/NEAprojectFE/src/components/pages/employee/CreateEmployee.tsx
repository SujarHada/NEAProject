import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type createEmployeesInputs } from "../../../interfaces/interfaces"
import { FaChevronDown } from "react-icons/fa"
const CreateEmployee = () => {
    const createEmployeesFormschema = z.object({
        firstName: z.string().min(1, "First Name is required"),
        middleName: z.string().optional(),
        lastName: z.string().min(1, "Last Name is required"),
        email: z.email({ error: "Email is invalid" }).min(1, "Email is required"),
        branchId: z.string().min(1, "Branch is required"),
        role: z.string().min(1, "Role is required"),
    })
    const { control, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<createEmployeesInputs>(
        {
            defaultValues: {
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                branchId: "",
                role: ""
            },
            resolver: zodResolver(createEmployeesFormschema),
            mode: "onSubmit"
        }
    )

    const onSubmit: SubmitHandler<createEmployeesInputs> = (data) => {
        console.log('Submitted')
        console.log(data);

        reset()
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Create Employee</h1>
            {/* <div className="flex gap-4 w-full"> */}
            <div className="flex flex-col lg:w-1/2 gap-2">
                <label htmlFor="name"> Branch Id *</label>
                <Controller
                    name="branchId"
                    control={control}
                    render={({ field }) => (
                        <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="name" />
                    )}
                />
                {errors.branchId && <p className="text-red-500">{errors.branchId.message}</p>}
            </div>
            {/* <div> */}
                <div className="flex  w-full flex-wrap gap-4">

                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="firstName"> First Name * </label>
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="firstName" />
                        )}
                    />
                    {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
                </div>
                {/* </div> */}

                    <div className="w-full flex-1 flex flex-col gap-2">
                        <label htmlFor="middleName"> Middle Name </label>
                        <Controller
                            name="middleName"
                            control={control}
                            render={({ field }) => (
                                <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="middleName" />
                            )}
                        />
                        {errors.middleName && <p className="text-red-500">{errors.middleName.message}</p>}
                    </div>
                    <div className="w-full flex flex-1 flex-col gap-2">
                        <label htmlFor="lastName"> Last name * </label>
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="lastName" />
                            )}
                        />
                        {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className="lg:w-1/2 flex flex-col gap-2 ">
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

                <div className="lg:w-1/2 flex flex-col relative">
                    <div className="flex ">
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <div className="flex w-full items-center">
                                    <select id="role" {...field} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none  px-3 rounded-md border-gray-600" >
                                        <option value="" disabled hidden> Role *</option>
                                        <option value="admin">Admin</option>
                                        <option value="accountant">Accountant</option>
                                        <option value="peon">Peon</option>
                                    </select>
                                    <FaChevronDown className="absolute right-3 text-gray-500" />
                                </div>

                            )}
                        />
                    </div>
                    <div className="flex ">
                        {errors.role && <p className="text-red-500"> {errors.role.message} </p>}
                    </div>
                </div>

                <div className="flex">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={handleSubmit(onSubmit)}
                        className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating..." : "Create User"}
                    </button>
                </div>
            </div>
            )
}

            export default CreateEmployee
