import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useDataStore from "../../../store/useDataStore";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import type { Receiver } from "../../../interfaces/interfaces";
import NepaliDatePicker from '@zener/nepali-datepicker-react';
import '@zener/nepali-datepicker-react/index.css';
const createLetterSchema = z.object({
    letterCount: z.string({ error: "Letter Count is required" }).regex(/^[0-9]+$/, "Incorrect format"),
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
}).refine((data) => {
    const sameOffice = data.receiver.office_name === data.receiverOfficeName
    return sameOffice

}, {
    error: "Receiver Office Name and Address must be the same as the Receiver",
    path: ["receiver"],
}
).refine((data) => {
    return data.items.every((item) => item.name && item.company && item.serial_number && item.unit_of_measurement)
}, {
    error: "All items must be filled",
    path: ["items"],
});
export type CreateLetter = z.infer<typeof createLetterSchema>;
const CreateLetter = () => {
    const { control, handleSubmit, formState: { isSubmitting, errors }, setValue } = useForm<CreateLetter>({
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
    const { Offices, Receivers, Products, ...StoreMethods } = useDataStore();
    const [filteredReceivers, setFilteredReceivers] = useState<Receiver[]>([]);

    useEffect(() => {
        StoreMethods.getOffices();
        StoreMethods.getReceivers();
        StoreMethods.getProducts();
    }, []);
    const handleOfficeChange = (officeId: string) => {
        const selectedOffice = Offices?.find((o) => o.id.toString() === officeId);
        if (selectedOffice) {
            setValue("receiverOfficeName", selectedOffice.name);
            setValue("receiverAddress", selectedOffice.address);
            StoreMethods.getReceivers();
            const filtered = Receivers?.filter(
                (r) => r.office_name === selectedOffice.name
            );
            setFilteredReceivers(filtered || []);
        } else {
            setValue("receiverOfficeName", "");
            setValue("receiverAddress", "");
            setFilteredReceivers([]);
        }
    };

    const handleReceiverChange = (receiverId: string) => {
        const selected = Receivers?.find((r) => r.id.toString() === receiverId);
        if (selected) {
            setValue("receiver.name", selected.name);
            setValue("receiver.post", selected.post);
            setValue("receiver.id_card_number", selected.id_card_number);
            setValue("receiver.id_card_type", selected.id_card_type);
            setValue("receiver.phone_number", selected.phone_number);
            setValue("receiver.vehicle_number", selected.vehicle_number);
            setValue("receiver.office_name", selected.office_name);
            setValue("receiver.office_address", selected.office_address);
        } else {
            setValue("receiver.name", "");
            setValue("receiver.post", "");
            setValue("receiver.id_card_number", "");
            setValue("receiver.id_card_type", "unknown");
            setValue("receiver.phone_number", "");
            setValue("receiver.vehicle_number", "");
        }
    };

    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const onSubmit = (data: CreateLetter) => {
        console.log("Submitted Data:", data);
    };
    return (
        <div className="flex flex-col gap-6  ">
            <h1 className="text-2xl font-bold text-gray-800">Create Letter</h1>
            <div className="flex flex-1 flex-row gap-2 flex-wrap">
                <div className="flex max-sm:w-full flex-col">
                    <label htmlFor="date"> Date * </label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-50 rounded-md border-gray-600">
                                <NepaliDatePicker {...field} onChange={(e) => { field.onChange(e!.toString()) }} className={'h-10 px-3 cursor-pointer'} placeholder="YYYY-MM-DD" />
                            </div>
                        )}
                    />
                    {errors.date && <span className="text-red-500">{errors.date.message}</span>}
                </div>
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



            </div>


            {/* Requesting Offices */}
            <div className="flex flex-col flex-wrap gap-2">
                <div className="flex  flex-row flex-1 gap-2 w-1/2 flex-wrap">
                    <div className="flex flex-col w-full">
                        <label htmlFor="officeSelect">Select Office *</label>
                        <select
                            id="officeSelect"
                            onChange={(e) => handleOfficeChange(e.target.value)}
                            className="bg-[#B5C9DC] border-2 h-10 outline-none px-3 rounded-md border-gray-600"
                        >
                            <option value="" hidden>Select Office</option>
                            {Offices?.map((office) => (
                                <option key={office.id} value={office.id}>
                                    {office.name}
                                </option>
                            ))}
                        </select>
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
                    <div className="flex flex-col w-full flex-1">
                        <label htmlFor="requestDate">Request date * </label>
                        <Controller
                            name="requestDate"
                            control={control}
                            render={({ field }) => (
                                <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-50 rounded-md border-gray-600">
                                    <NepaliDatePicker {...field} onChange={(e) => { field.onChange(e!.toString()) }} className={'h-10 px-3 cursor-pointer'} placeholder="YYYY-MM-DD" />
                                </div>)}
                        />
                        {errors.requestDate && <span className="text-red-500">{errors.requestDate.message}</span>}
                    </div>
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

                </div>
            </div>

            {/* --- Items --- */}
            <div className="flex flex-col flex-1  gap-4 border-1  rounded-2xl p-5">
                <h2 className="font-semibold text-gray-700">Items</h2>
                {fields.map((item, index) => (
                    <div key={item.id} className="flex flex-wrap  flex-row flex-1  border-2 items-center p-3 rounded-2xl shadow-gray-700 gap-2 ">
                        <div className="flex flex-col w-full gap-2">
                            <label>Product *</label>
                            <Controller
                                name={`items.${index}.name`}
                                control={control}
                                render={({ field }) => (
                                    <div className="flex flex-1 items-center relative">
                                        <select
                                            {...field}
                                            // @ts-ignore
                                            value={field.value[index]?.name!}
                                            onChange={(e) => {
                                                const productId = e.target.value;
                                                const selected = Products?.find(
                                                    (p) => p.id.toString() === productId
                                                );

                                                if (selected) {
                                                    setValue(`items.${index}.name`, selected.name);
                                                    setValue(`items.${index}.company`, selected.company);
                                                    setValue(
                                                        `items.${index}.serial_number`,
                                                        Number(selected.serial_number)
                                                    );
                                                    setValue(
                                                        `items.${index}.unit_of_measurement`,
                                                        selected.unit_of_measurement
                                                    );
                                                } else {
                                                    setValue(`items.${index}.company`, "");
                                                    setValue(`items.${index}.serial_number`, 0);
                                                    setValue(`items.${index}.unit_of_measurement`, "");
                                                    setValue(`items.${index}.quantity`, 0);
                                                }
                                            }}
                                            className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600"                                        >
                                            <option value="" hidden>Select Product</option>
                                            {Products?.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                        <FaChevronDown className="absolute right-3 text-gray-500" />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="flex flex-1 flex-col gap-2">
                            <label htmlFor="quantity" >Quantity</label>
                            <Controller
                                name={`items.${index}.quantity` as any}
                                control={control}
                                render={({ field: f }) => (
                                    <input
                                        {...f}
                                        onChange={(e) => f.onChange(Number(e.target.value))}
                                        id='quantity'
                                        type='number'
                                        className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600"
                                    />
                                )}
                            />
                            {errors.items?.[index]?.quantity && <span className="text-red-500">{errors.items?.[index]?.quantity.message}</span>}
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
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
                        <button type="button" className="bg-red-500 self-end text-white px-3  rounded h-10" onClick={() => remove(index)}>Remove</button>
                    </div>
                ))}
                {
                    errors.items && <span className="text-red-500">{errors.items.root?.message}</span>
                }

                <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => append({ name: "", company: "", serial_number: 0, unit_of_measurement: "", quantity: '' as unknown as number, remarks: "" })}
                >
                    Add Item
                </button>
            </div>

            {/* Receiver */}
            <div className="flex flex-col w-1/2">
                <label htmlFor="receiverSelect">Select Receiver *</label>
                <select
                    id="receiverSelect"
                    onChange={(e) => handleReceiverChange(e.target.value)}
                    className="bg-[#B5C9DC] border-2 h-10 outline-none px-3 rounded-md border-gray-600"
                    disabled={!filteredReceivers.length}
                >
                    <option value="" hidden>
                        {filteredReceivers.length
                            ? "Select Receiver"
                            : "No receivers found in current selected office"}
                    </option>
                    {filteredReceivers.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </select>
                {errors.receiver && <span className="text-red-500">{errors.receiver.message}</span>}
            </div>


            {/* --- Submit Button --- */}
            <div className="flex mt-4">
                <button
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Letter"}
                </button>
            </div>
        </div>
    );
};

export default CreateLetter