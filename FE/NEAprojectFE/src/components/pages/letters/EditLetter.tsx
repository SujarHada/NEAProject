import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useDataStore from "../../../store/useDataStore";
import { useEffect, useState } from "react";
import type { Receiver } from "../../../interfaces/interfaces";
import NepaliDatePicker from "@zener/nepali-datepicker-react";
import "@zener/nepali-datepicker-react/index.css";
import api from "../../../utils/api";
import { useParams } from "react-router";

const EditLetterSchema = z.object({
    id: z.number().optional(),
    letter_count: z.string().regex(/^[\d\u0966-\u096F]+$/, "Letter count must be numeric"),
    chalani_no: z.string().min(1, "Chalani number is required"),
    voucher_no: z.string().min(1, "Voucher number is required"),
    date: z.string().min(1, "Date is required"),
    receiver_office_name: z.string().min(1, "Receiver office name is required"),
    receiver_address: z.string().min(1, "Receiver address is required"),
    subject: z.string().min(1, "Subject is required"),
    request_chalani_number: z.string().min(1, "Request chalani number is required"),
    request_letter_count: z.string().regex(/^[\d\u0966-\u096F]+$/, "Request letter count must be numeric"),
    request_date: z.string().min(1, "Request date is required"),
    gatepass_no: z.string().optional(),

    items: z
        .array(
            z.object({
                id: z.number().optional(),
                name: z.string().min(1, "Item name is required"),
                company: z.string().min(1, "Company name is required"),
                serial_number: z.string().min(1, "Serial number is required"),
                unit_of_measurement: z.string().min(1, "Unit of measurement is required"),
                quantity: z.string().regex(/^[\d\u0966-\u096F]+$/, "Quantity must be numeric"),
                remarks: z.string().optional(),
            })
        )
        .min(1, "At least one item is required"),

    receiver: z.object({
        name: z.string().min(1, "Receiver name is required"),
        post: z.string().min(1, "Receiver post is required"),
        id_card_number: z.string().min(1, "ID card number is required"),
        id_card_type: z.enum([
            "national_id",
            "citizenship",
            "voter_id",
            "passport",
            "drivers_license",
            "pan_card",
            "unknown",
        ]),
        office_name: z.string().min(1, "Office name is required"),
        office_address: z.string().min(1, "Office address is required"),
        phone_number: z.string().min(1, "Phone number is required"),
        vehicle_number: z.string().min(1, "Vehicle number is required"),
    }),
});
export type EditLetter = z.infer<typeof EditLetterSchema>;

const EditLetter = () => {
    const { id } = useParams<{ id: string }>();
    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setValue,
        reset,
    } = useForm<EditLetter>({
        resolver: zodResolver(EditLetterSchema),
        defaultValues: {
            letter_count: "",
            items: [],
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
            date: "",
            chalani_no: "",
            voucher_no: "",
            gatepass_no: "",
            receiver_office_name: "",
            receiver_address: "",
            subject: "",
            request_chalani_number: "",
            request_letter_count: "",
            request_date: "",
        },
    });

    const { Offices, Receivers, Products, ...StoreMethods } = useDataStore();
    const [filteredReceivers, setFilteredReceivers] = useState<Receiver[]>([]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    // Fetch all store data first
    useEffect(() => {
        StoreMethods.getOffices();
        StoreMethods.getReceivers();
        StoreMethods.getProducts();
    }, []);

    // Fetch the letter data and populate form
    useEffect(() => {
        const fetchLetter = async () => {
            try {
                const res = await api.get(`/api/letters/${id}/`);
                if (res.status === 200) {
                    const letter = res.data.data;

                    // Filter receivers based on the fetched office
                    const officeReceivers = Receivers?.filter(
                        (r) => r.office_name === letter.receiver_office_name
                    );
                    setFilteredReceivers(officeReceivers || []);

                    // Set the entire form with backend data
                    reset({
                        ...letter,
                        receiver: {
                            ...letter.receiver,
                            id_card_type:
                                letter.receiver.id_card_type || "unknown",
                        },
                    });
                }
            } catch (err) {
                console.error("Error fetching letter:", err);
            }
        };

        // Wait until store data is available
        if (Receivers && Offices && Products) {
            fetchLetter();
        }
    }, [Receivers, Offices, Products]);

    const handleOfficeChange = (officeId: string) => {
        const selectedOffice = Offices?.find((o) => o.id.toString() === officeId);
        if (selectedOffice) {
            setValue("receiver_office_name", selectedOffice.name);
            setValue("receiver_address", selectedOffice.address);

            const filtered = Receivers?.filter(
                (r) => r.office_name === selectedOffice.name
            );
            setFilteredReceivers(filtered || []);
        } else {
            setValue("receiver_office_name", "");
            setValue("receiver_address", "");
            setFilteredReceivers([]);
        }
    };

    const handleReceiverChange = (receiverId: string) => {
        const selected = Receivers?.find((r) => r.id.toString() === receiverId);
        if (selected) {
            setValue("receiver", selected);
        }
    };

    const onSubmit = async (data: EditLetter) => {
        try {
            const res = await api.put(`/api/letters/${id}/`, data);
            if (res.status === 200) {
                alert("Letter updated successfully!");
            }
        } catch (err) {
            console.error("Error updating letter:", err);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Letter</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                {/* --- Date and IDs --- */}
                <div className="flex flex-1 flex-row gap-2 flex-wrap">
                    <div className="flex max-sm:w-full flex-col">
                        <label htmlFor="date"> Date * </label>
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-0 rounded-md border-gray-600">
                                    <NepaliDatePicker {...field} onChange={(e) => { field.onChange(e!.toString()) }} className={'h-10 px-3 cursor-pointer'} placeholder="YYYY-MM-DD" />
                                </div>
                            )}
                        />
                        {errors.date && <span className="text-red-500">{errors.date.message}</span>}
                    </div>
                    <div className="flex flex-1 w-full flex-col">
                        <label htmlFor="letter_count"> Letter count * </label>
                        <Controller
                            name="letter_count"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="letter_count" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.letter_count && <span className="text-red-500">{errors.letter_count.message}</span>}
                    </div>
                    <div className="flex flex-1 w-full flex-col">
                        <label htmlFor="chalani"> Chalani No *</label>
                        <Controller
                            name="chalani_no"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="chalani" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.chalani_no && <span className="text-red-500">{errors.chalani_no.message}</span>}
                    </div>

                    <div className="flex flex-1 w-full flex-col ">
                        <label htmlFor="voucher_no"> Voucher No * </label>
                        <Controller
                            name="voucher_no"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="voucher_no" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.voucher_no && <span className="text-red-500">{errors.voucher_no.message}</span>}
                    </div>

                    <div className="flex max-md:flex-1 max-md:w-full flex-col ">
                        <label htmlFor="gatepass_no"> GatePass No</label>
                        <Controller
                            name="gatepass_no"
                            control={control}
                            render={({ field }) => (
                                <input {...field} id="gatepass_no" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                            )}
                        />
                        {errors.gatepass_no && <span className="text-red-500">{errors.gatepass_no.message}</span>}
                    </div>



                </div>

                {/* --- Subject + Office --- */}
                <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col flex-1">
                        <label>Select Office *</label>
                        <select
                            onChange={(e) => handleOfficeChange(e.target.value)}
                            value={
                                Offices?.find(
                                    (o) => o.name === control._formValues.receiver_office_name
                                )?.id || ""
                            }
                            className="bg-[#B5C9DC] pl-3 border-2 h-10 rounded-md border-gray-600"
                        >
                            <option value="" hidden>
                                Select Office
                            </option>
                            {Offices?.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col flex-1">
                        <label>Subject *</label>
                        <Controller
                            name="subject"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    className="bg-[#B5C9DC] border-2 h-10 pl-3 rounded-md border-gray-600"
                                />
                            )}
                        />
                    </div>
                    <div className="flex flex-row w-full gap-2 mt-4 flex-wrap">
                        <div className="flex flex-col w-full flex-1">
                            <label htmlFor="request_date">Request date * </label>
                            <Controller
                                name="request_date"
                                control={control}
                                render={({ field }) => (
                                    <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-50 rounded-md border-gray-600">
                                        <NepaliDatePicker {...field} onChange={(e) => { field.onChange(e!.toString()) }} className={'h-10 px-3 cursor-pointer'} placeholder="YYYY-MM-DD" />
                                    </div>)}
                            />
                            {errors.request_date && <span className="text-red-500">{errors.request_date.message}</span>}
                        </div>
                        <div className="flex flex-col w-full  flex-1">
                            <label htmlFor="request_chalani_number"> Request chalani number * </label>
                            <Controller
                                name="request_chalani_number"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} id="request_chalani_number" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                                )}
                            />
                            {errors.request_chalani_number && <span className="text-red-500">{errors.request_chalani_number.message}</span>}
                        </div>
                        <div className="flex flex-col w-full flex-1">
                            <label htmlFor="request_letter_count"> Request letter count * </label>
                            <Controller
                                name="request_letter_count"
                                control={control}
                                render={({ field }) => (
                                    <input {...field} id="request_letter_count" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />
                                )}
                            />
                            {errors.request_letter_count && <span className="text-red-500">{errors.request_letter_count.message}</span>}
                        </div>

                    </div>
                </div>

                {/* --- Items Section --- */}
                <div className="flex flex-col flex-1  gap-4 border-1  rounded-2xl p-5">
                    <h2 className="font-semibold text-gray-700">Items</h2>
                    {fields.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex flex-wrap  flex-row flex-1  border-2 items-center p-3 rounded-2xl shadow-gray-700 gap-2"
                        >
                            <div className="flex flex-col w-full gap-2">
                                <label>Product *</label>
                                <select
                                    value={
                                        Products?.find((p) => p.name === item.name)?.id || ""
                                    }
                                    onChange={(e) => {
                                        const selected = Products?.find(
                                            (p) => p.id.toString() === e.target.value
                                        );
                                        if (selected) {
                                            setValue(`items.${index}.name`, selected.name);
                                            setValue(`items.${index}.company`, selected.company);
                                            setValue(
                                                `items.${index}.serial_number`,
                                                selected.serial_number.toString()
                                            );
                                            setValue(
                                                `items.${index}.unit_of_measurement`,
                                                selected.unit_of_measurement
                                            );
                                        }
                                    }}
                                    className="bg-[#B5C9DC] pl-3 border-2 h-10 rounded-md border-gray-600"
                                >
                                    <option value="" hidden>
                                        Select Product
                                    </option>
                                    {Products?.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col flex-1">
                                <label>Qty</label>
                                <Controller
                                    name={`items.${index}.quantity`}
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            className="bg-[#B5C9DC] pl-3 border-2 h-10 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label>Remarks</label>
                                <Controller
                                    name={`items.${index}.remarks`}
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            className="bg-[#B5C9DC] border-2 pl-3 h-10 rounded-md border-gray-600"
                                        />
                                    )}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="bg-red-500 text-white rounded-md px-3 h-10 self-end"
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() =>
                            append({
                                name: "",
                                company: "",
                                serial_number: "",
                                unit_of_measurement: "",
                                quantity: "",
                                remarks: "",
                            })
                        }
                    >
                        Add Item
                    </button>
                </div>

                {/* Receiver Section */}
                <div className="flex flex-col w-1/2">
                    <label>Select Receiver *</label>
                    <select
                        onChange={(e) => handleReceiverChange(e.target.value)}
                        value={
                            filteredReceivers.find(
                                (r) => r.name === control._formValues.receiver.name
                            )?.id || ""
                        }
                        className="bg-[#B5C9DC] border-2 pl-3 h-10 rounded-md border-gray-600"
                    >
                        <option value="" hidden>
                            Select Receiver
                        </option>
                        {filteredReceivers.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? "Saving..." : "Update Letter"}
                </button>
            </form>
        </div>
    );
};

export default EditLetter;
