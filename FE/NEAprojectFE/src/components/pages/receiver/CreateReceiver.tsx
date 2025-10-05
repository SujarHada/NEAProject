import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { type createReceiverInputs } from "../../../interfaces/interfaces"
const CreateReceiver = () => {
    const CreateReceiversFormschema = z.object({
        name: z.string().min(1, "Receiver Name is required"),
        departmentName: z.string().min(1, "Department Name is required"),
        departmentAddress: z.string().min(1, "Department Address is required"),
        id: z.string().min(1, "ID is required"),
        idType: z.string().min(1, "ID Type is required"),
        phoneNo: z.string().min(1, "Phone No should be of length 10"),
        post: z.string().min(1, "Post is required"),
        vehicleNo: z.string().min(1, "Vehicle No is required"),
    })
    const { control, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<createReceiverInputs>(
        {
            defaultValues: {
                name: "",
                departmentName: "",
                departmentAddress: "",
                id: "",
                idType: "",
                phoneNo: "",
                post: "",
                vehicleNo: "",
            },
            resolver: zodResolver(CreateReceiversFormschema),
            mode: "onSubmit"
        }
    )

    const onSubmit: SubmitHandler<createReceiverInputs> = (data) => {
        console.log('Submitted')
        console.log(data);

        reset()
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Create Receiver</h1>
            <div className="flex gap-4 w-full flex-wrap">
                <div className="flex flex-col flex-1 lg:w-1/2 gap-2">
                    <label htmlFor="name"> Receiver's name *</label>
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
                    <label htmlFor="post"> Post * </label>
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
                    <label htmlFor="id"> Id card No. * </label>
                    <Controller
                        name="id"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="id" />
                        )}
                    />
                    {errors.id && <p className="text-red-500">{errors.id.message}</p>}
                </div>
                <div className="w-full flex flex-1 flex-col gap-2">
                    <label htmlFor="idType"> Id card type * </label>
                    <Controller
                        name="idType"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="idType" />
                        )}
                    />
                    {errors.idType && <p className="text-red-500">{errors.idType.message}</p>}
                </div>
            </div>
            <div className="flex gap-4 w-full flex-wrap">
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="departmentName"> Department name * </label>
                    <Controller
                        name="departmentName"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="departmentName" />
                        )}
                    />
                    {errors.departmentName && <p className="text-red-500">{errors.departmentName.message}</p>}
                </div>
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="departmentAddress"> Department address * </label>
                    <Controller
                        name="departmentAddress"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="departmentAddress" />
                        )}
                    />
                    {errors.departmentAddress && <p className="text-red-500">{errors.departmentAddress.message}</p>}
                </div>
            </div>
            <div className="flex gap-4 w-full flex-wrap">
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="phoneNo"> Phone no. * </label>
                    <Controller
                        name="phoneNo"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="phoneNo" />
                        )}
                    />
                    {errors.phoneNo && <p className="text-red-500">{errors.phoneNo.message}</p>}
                </div>
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="vehicleNo"> Vehicle no. * </label>
                    <Controller
                        name="vehicleNo"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="vehicleNo" />
                        )}
                    />
                    {errors.vehicleNo && <p className="text-red-500">{errors.vehicleNo.message}</p>}
                </div>
            </div>
            <div className="flex">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create receiver"}
                </button>
            </div>
        </div>
    )
}

export default CreateReceiver
