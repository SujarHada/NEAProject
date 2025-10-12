import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type createEmployeesInputs } from "../../../interfaces/interfaces"
import { FaChevronDown } from "react-icons/fa"
import axios from "axios"
import { useNavigate } from "react-router"
const CreateEmployee = () => {
    const createEmployeesFormschema = z.object({
        first_name: z.string().min(1, "First Name is required"),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, "Last Name is required"),
        email: z.email({ message: "Email is invalid" }).min(1, "Email is required"),
        organization_id: z.string().min(1, "Organization Id is required"),
        position: z.string().min(1, "Position is required"),
    })
    const { control, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<createEmployeesInputs>(
        {
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
        }
    )
    const navigate = useNavigate()
    const onSubmit = async (data: createEmployeesInputs) => {
        const res = await axios.post("http://127.0.0.1:8000/api/employees/", data)
        if(res.status === 201){
            navigate("/employees/manage")
        } 

        reset()
    }
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Create Employee</h1>
            {/* <div className="flex gap-4 w-full"> */}
            <div className="flex flex-col lg:w-1/2 gap-2">
                <label htmlFor="organization_id"> Branch Id *</label>
                <Controller
                    name="organization_id"
                    control={control}
                    render={({ field }) => (
                        <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="organization_id" />
                    )}
                />
                {errors.organization_id && <p className="text-red-500">{errors.organization_id.message}</p>}
            </div>
            {/* <div> */}
                <div className="flex  w-full flex-wrap gap-4">

                <div className="flex flex-1 flex-col w-full gap-2">
                    <label htmlFor="first_name"> First Name * </label>
                    <Controller
                        name="first_name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="first_name" />
                        )}
                    />
                    {errors.first_name && <p className="text-red-500">{errors.first_name.message}</p>}
                </div>
                {/* </div> */}

                    <div className="w-full flex-1 flex flex-col gap-2">
                        <label htmlFor="middle_name"> Middle Name </label>
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
                        <label htmlFor="last_name"> Last name * </label>
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
                            name="position"
                            control={control}
                            render={({ field }) => (
                                <div className="flex w-full items-center">
                                    <select id="position" {...field} className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none  px-3 rounded-md border-gray-600" >
                                        <option value="" disabled hidden> position *</option>
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
                        {errors.position && <p className="text-red-500"> {errors.position.message} </p>}
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
