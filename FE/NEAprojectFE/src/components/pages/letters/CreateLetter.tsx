import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { id_types } from "../../../enum/id_types";

const createLetterSchema = z.object({
    letterCount: z.string({error: "Letter Count is required"}).regex(/^[0-9]+$/, "Incorrect format"),
    chalaniNo: z.number({ error: "Chalani No must be a number" }),
    voucherNo: z.number({ error: "Voucher No must be a number" }),
    gatepassNo: z.number({ error: "Gatepass No must be a number" }).optional(),
    date: z.string().min(1, "Date is required"),
    receiverOfficeName: z.string().min(1, "Receiver Office Name is required"),
    receiverAddress: z.string().min(1, "Receiver Address is required"),
    subject: z.string().min(1, "Subject is required"),
    requestChalaniNumber: z.string().min(1, "Request Chalani Number is required"),
    requestLetterCount: z.string().min(1, "Request Letter Count is required"),
    requestDate: z.string().min(1, "Request Date is required"),
    items: z.array(
        z.object({
            name: z.string().min(1, "Item Name is required"),
            company: z.string().min(1, "Company is required"),
            serial_number: z.number({ error: "Serial Number must be a number" }),
            unit_of_measurement: z.string().min(1, "Unit is required"),
            quantity: z.number({ error: "Quantity must be a number" }),
            remarks: z.string().optional(),
        })
    ).min(1, "At least one item is required"),
    receiver: z.object({
        name: z.string().min(1, "Receiver Name is required"),
        post: z.string().min(1, "Receiver Post is required"),
        id_card_number: z.string().min(1, "ID Card Number is required"),
        id_card_type: z.enum([
            "national_id",
            "citizenship",
            "voter_id",
            "passport",
            "drivers_license",
            "pan_card",
            "unknown",
        ]),
        office_name: z.string().min(1, "Office Name is required"),
        office_address: z.string().min(1, "Office Address is required"),
        phone_number: z.string().min(1, "Phone Number is required"),
        vehicle_number: z.string().min(1, "Vehicle Number is required"),
    }),
});

export type CreateLetter = z.infer<typeof createLetterSchema>;
const CreateLetter = () => {
    const { control, handleSubmit, formState: { isSubmitting, errors } } = useForm<CreateLetter>({
        resolver: zodResolver(createLetterSchema),
        defaultValues: {
            letterCount: "",
            items: [{
                name: "",
                company: "",
                serial_number: "" as unknown as number,
                unit_of_measurement: "",
                quantity: "" as unknown as number,
                remarks: "",
            }],
            receiver: {
                name: "",
                post: "",
                id_card_number: "",
                id_card_type: "unknown",
                office_name: "",
                office_address: "",
                phone_number: "",
                vehicle_number: "",
            },
            date: '',
            chalaniNo: '' as unknown as number,
            voucherNo: '' as unknown as number,
            gatepassNo: '' as unknown as number,
            receiverOfficeName: '',
            receiverAddress: '',
            subject: '',
            requestChalaniNumber: '',
            requestLetterCount: '',
            requestDate: '',

        },
        mode: 'onSubmit'
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const onSubmit = (data: CreateLetter) => {
        console.log("Submitted Data:", data);
    };

    return (
        <div className="flex flex-col gap-6  ">
            <h1 className="text-2xl font-bold text-gray-800">Create Letter</h1>
            <div className="flex flex-1 flex-row gap-2 flex-wrap">
                <div className="flex flex-1 w-full flex-col">
                    <label htmlFor="lettercount"> Letter count * </label>
                    <Controller
                        name="letterCount"
                        control={control}
                        render={({ field }) => (
                            <input {...field} id="lettercount" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.letterCount && <span className="text-red-500">{errors.letterCount.message}</span>}
                </div>
                <div className="flex flex-1 w-full flex-col">
                    <label htmlFor="chalani"> Chalani No *</label>
                    <Controller
                        name="chalaniNo"
                        control={control}
                        render={({ field }) => (
                            <input {...field} onChange={(e) => field.onChange(Number(e.target.value))} id="chalani" type="number" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.chalaniNo && <span className="text-red-500">{errors.chalaniNo.message}</span>}
                </div>

                <div className="flex flex-1 w-full flex-col ">
                    <label htmlFor="voucherno"> Voucher No * </label>
                    <Controller
                        name="voucherNo"
                        control={control}
                        render={({ field }) => (
                            <input {...field} onChange={(e) => field.onChange(Number(e.target.value))} id="voucherno" type="number" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.voucherNo && <span className="text-red-500">{errors.voucherNo.message}</span>}
                </div>

                <div className="flex max-md:flex-1 max-md:w-full flex-col ">
                    <label htmlFor="gatepassno"> GatePass No</label>
                    <Controller
                        name="gatepassNo"
                        control={control}
                        render={({ field }) => (
                            <input {...field} id="gatepassno" onChange={(e) => field.onChange(Number(e.target.value))} type="number" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.gatepassNo && <span className="text-red-500">{errors.gatepassNo.message}</span>}
                </div>

                <div className="flex max-sm:w-full flex-col">
                    <label htmlFor="date"> Date * </label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <input {...field} id="date" type="date" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                        )}
                    />
                    {errors.date && <span className="text-red-500">{errors.date.message}</span>}
                </div>

            </div>


            {/* Requesting Offices */}
            <div className="flex flex-col flex-wrap gap-2">
                <div className="flex  flex-row flex-1 gap-2 w-full flex-wrap">
                    <div className="flex w-full flex-col flex-1">
                        <label htmlFor="receiverOfficeName">Requesting Office *</label>
                        <Controller
                            name="receiverOfficeName"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverOfficeName" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiverOfficeName && <span className="text-red-500">{errors.receiverOfficeName.message}</span>}
                    </div>
                    <div className="flex w-full flex-col flex-1">
                        <label htmlFor="receiverAddress"> Requesting office address * </label>
                        <Controller
                            name="receiverAddress"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverAddress" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiverAddress && <span className="text-red-500">{errors.receiverAddress.message}</span>}
                    </div>
                    <div className="flex w-full flex-col flex-1">
                        <label htmlFor="subject"> Subject *</label>
                        <Controller
                            name="subject"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="subject" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.subject && <span className="text-red-500">{errors.subject.message}</span>}
                    </div>
                </div>
                <div className="flex flex-row w-full gap-2 flex-wrap">
                    <div className="flex flex-col w-full  flex-1">
                        <label htmlFor="requestChalaniNumber"> Request chalani number * </label>
                        <Controller
                            name="requestChalaniNumber"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="requestChalaniNumber" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.requestChalaniNumber && <span className="text-red-500">{errors.requestChalaniNumber.message}</span>}
                    </div>
                    <div className="flex flex-col w-full flex-1">
                        <label htmlFor="requestLetterCount"> Request letter count * </label>
                        <Controller
                            name="requestLetterCount"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="requestLetterCount" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.requestLetterCount && <span className="text-red-500">{errors.requestLetterCount.message}</span>}
                    </div>
                    <div className="flex flex-col w-full flex-1">
                        <label htmlFor="requestDate">Request date * </label>
                        <Controller
                            name="requestDate"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="requestDate" type="date" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.requestDate && <span className="text-red-500">{errors.requestDate.message}</span>}
                    </div>
                </div>
            </div>

            {/* --- Items --- */}
            <div className="flex flex-col  gap-4 border-1  rounded-2xl p-5">
                <h2 className="font-semibold text-gray-700">Items</h2>
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex flex-wrap flex-row flex-1  border-2 p-3 rounded-2xl shadow-gray-700 gap-2 ">
                            <div className="flex  flex-1 flex-col gap-2">
                                <label htmlFor="itemname" >Name *</label>
                                <Controller
                                    name={`items.${index}.name` as any}
                                    control={control}
                                    render={({ field: f }) => (
                                        <input
                                            {...f}
                                            id='itemname'
                                            type='text'
                                            className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                                {errors.items?.[index]?.name && <span className="text-red-500">{errors.items?.[index]?.name.message}</span>}
                            </div>
                            <div className="flex  flex-1 flex-col gap-2">
                                <label htmlFor="companyName" >Company name *</label>
                                <Controller
                                    name={`items.${index}.company` as any}
                                    control={control}
                                    render={({ field: f }) => (
                                        <input
                                            {...f}
                                            id='companyName'
                                            type='text'
                                            className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                                {errors.items?.[index]?.company && <span className="text-red-500">{errors.items?.[index]?.company.message}</span>}
                            </div>
                            <div className="flex  flex-1 flex-col gap-2">
                                <label htmlFor="serialNo" >Serial No. *</label>
                                <Controller
                                    name={`items.${index}.serial_number` as any}
                                    control={control}
                                    render={({ field: f }) => (
                                        <input
                                            {...f}
                                            onChange={(e) => f.onChange(+e.target.value)}
                                            id='serialNo'
                                            type='number'
                                            className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                                {errors.items?.[index]?.serial_number && <span className="text-red-500">{errors.items?.[index]?.serial_number.message}</span>}
                            </div>
                            <div className="flex  flex-1 flex-col gap-2">
                                <label htmlFor="unit" >Unit *</label>
                                <Controller
                                    name={`items.${index}.unit_of_measurement` as any}
                                    control={control}
                                    render={({ field: f }) => (
                                        <input
                                            {...f}
                                            id='unit'
                                            type='text'
                                            className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                                {errors.items?.[index]?.unit_of_measurement && <span className="text-red-500">{errors.items?.[index]?.unit_of_measurement.message}</span>}
                            </div>
                            <div className="flex  flex-1 flex-col gap-2">
                                <label htmlFor="quantity" >Quantity *</label>
                                <Controller
                                    name={`items.${index}.quantity` as any}
                                    control={control}
                                    render={({ field: f }) => (
                                        <input
                                            {...f}
                                            onChange={(e) => f.onChange(+e.target.value)}
                                            id='unit'
                                            type='number'
                                            className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                                {errors.items?.[index]?.quantity && <span className="text-red-500">{errors.items?.[index]?.quantity.message}</span>}
                            </div>
                            <div className="flex  flex-1 flex-col gap-2">
                                <label htmlFor="remarks" >Remarks</label>
                                <Controller
                                    name={`items.${index}.remarks` as any}
                                    control={control}
                                    render={({ field: f }) => (
                                        <input
                                            {...f}
                                            id='unit'
                                            type='text'
                                            className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                                {errors.items?.[index]?.remarks && <span className="text-red-500">{errors.items?.[index]?.remarks.message}</span>}
                            </div>
                            <button type="button" className="bg-red-500 self-end text-white px-3 py-1 rounded h-10" onClick={() => remove(index)}>Remove</button>
                        </div>
                    ))}

                <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => append({ name: "", company: "", serial_number: '' as unknown as number, unit_of_measurement: "", quantity: '' as unknown as number, remarks: "" })}
                >
                    Add Item
                </button>
            </div>

            {/* Receiver */}

            <div className="gap-2 flex flex-col">
                <div className="flex flex-row w-full gap-2 flex-wrap">
                    <div className="flex flex-col flex-2">
                        <label htmlFor="receiverName"> Receiver's name * </label>
                        <Controller
                            name="receiver.name"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverName" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiver?.name && <span className="text-red-500">{errors.receiver?.name.message}</span>}
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverPost">Post *</label>
                        <Controller
                            name="receiver.post"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverPost" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiver?.post && <span className="text-red-500">{errors.receiver?.post.message}</span>}
                    </div>
                </div>
                <div className="flex flex-row w-full gap-2 flex-wrap">
                    <div className="flex flex-col flex-2" >
                        <label htmlFor="receiverIdCardNumber"> ID card No: </label>
                        <Controller
                            name="receiver.id_card_number"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverIdCardNumber" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiver?.id_card_number && <span className="text-red-500">{errors.receiver?.id_card_number.message}</span>}
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="idCardType"> ID card type * </label>
                        <Controller
                            name="receiver.id_card_type"
                            control={control}
                            render={({ field }) => (
                                <select id="idCardType" {...field} className="bg-[#B5C9DC] block border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                    {
                                        id_types.map((idType) => (
                                            <option key={idType.id} value={idType.value}>{idType.name}</option>
                                        ))
                                    }
                                </select>
                            )}
                        />
                        {errors.receiver?.id_card_type && <span className="text-red-500">{errors.receiver?.id_card_type.message}</span>}
                    </div>
                </div>
                <div className="flex flex-row w-full gap-2 flex-wrap">
                    <div className="flex flex-col flex-2" >
                        <label htmlFor="receiverOfficeName"> Office name * </label>
                        <Controller
                            name="receiver.office_name"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverOfficeName" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiver?.office_name && <span className="text-red-500">{errors.receiver?.office_name.message}</span>}
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverOfficeAddress"> Office address * </label>
                        <Controller
                            name="receiver.office_address"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverOfficeAddress" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiver?.office_address && <span className="text-red-500">{errors.receiver?.office_address.message}</span>}

                    </div>
                </div>
                <div className="flex flex-row w-full gap-2 flex-wrap">
                    <div className="flex flex-col flex-2">
                        <label htmlFor="receiverPhoneNo"> Phone No. * </label>
                        <Controller
                            name="receiver.phone_number"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="receiverPhoneNo" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiver?.phone_number && <span className="text-red-500">{errors.receiver?.phone_number.message}</span>}
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="vehicleNo">Vehicle No.* </label>
                        <Controller
                            name="receiver.vehicle_number"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="vehicleNo" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.receiver?.vehicle_number && <span className="text-red-500">{errors.receiver?.vehicle_number.message}</span>}
                    </div>
                </div>
            </div>

            {/* --- Submit Button --- */}
            <div className="flex mt-4">
                <button
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? "Submitting..." : "Submit Letter"}
                </button>
            </div>
        </div>
    );
};

export default CreateLetter