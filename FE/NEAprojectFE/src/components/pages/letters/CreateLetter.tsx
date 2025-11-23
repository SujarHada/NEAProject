import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useDataStore from "../../../store/useDataStore";
import { useEffect, useState } from "react";

import type { Receiver } from "../../../interfaces/interfaces";
import NepaliDatePicker, { NepaliDate } from '@zener/nepali-datepicker-react';
import '@zener/nepali-datepicker-react/index.css';
import api from "../../../utils/api";
import { useNavigate } from "react-router";
import { type CreateLetter as CreateLetterI, createLetterSchema } from "../../../schemas/letter";
import { useTranslation } from "react-i18next";
import { engToNep, nepToEng } from "../../../utils/englishtonepaliNumber";

const CreateLetter = () => {
    const { t } = useTranslation();
    const { control, handleSubmit, formState: { isSubmitting, errors }, setValue } = useForm<CreateLetterI>({
        resolver: zodResolver(createLetterSchema),
        defaultValues: {
            letter_count: "",
            items: [{ name: "", company: "", serial_number: "", unit_of_measurement: "", quantity: "", remarks: "" }],
            receiver: { name: "", post: "", id_card_number: "", id_card_type: "unknown", office_name: "", office_address: "", phone_number: "", vehicle_number: "" },
            date: new NepaliDate().format('YYYY-MM-DD', 'np'), chalani_no: '', voucher_no: '', gatepass_no: '',
            office_name: '', receiver_address: '', subject: ' जिन्सी सामान हस्तान्तरण गरी पठाइएको बारे ।',
            request_chalani_number: '', request_letter_count: '', request_date: new NepaliDate().format('YYYY-MM-DD', 'np')
        },
        mode: 'onSubmit'
    });
    const { Offices, Receivers, Products, LetterCreationData, ...StoreMethods } = useDataStore();
    const [filteredReceivers, setFilteredReceivers] = useState<Receiver[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        StoreMethods.getOffices();
        StoreMethods.getReceivers();
        StoreMethods.getProducts();
        StoreMethods.getLetterCreationData();
    }, []);

    useEffect(() => {
        if (LetterCreationData) {
            setValue("letter_count", engToNep(LetterCreationData.fiscal_year));
            setValue("chalani_no", LetterCreationData.chalani_no_nepali);
            setValue("voucher_no", engToNep(LetterCreationData.voucher_no));
        }
    }, [LetterCreationData]);

    const handleOfficeChange = (officeId: string) => {
        const selectedOffice = Offices?.find(o => o.id.toString() === officeId);
        if (selectedOffice) {
            setValue("office_name", selectedOffice.name);
            setValue("receiver_address", selectedOffice.address);
            const filtered = Receivers?.filter(r => r.office_name === selectedOffice.name);
            setFilteredReceivers(filtered || []);
        } else {
            setValue("office_name", "");
            setValue("receiver_address", "");
            setFilteredReceivers([]);
        }
    };

    const handleReceiverChange = (receiverId: string) => {
        const selected = Receivers?.find(r => r.id.toString() === receiverId);
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

    const onSubmit = async (data: CreateLetterI) => {
        console.log(data)
        const res = await api.post('/api/letters/', data);
        if (res.status === 201) navigate(`/letters/view-letter/${res.data.data.id}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-gray-800">{t("createLetter.title")}</h1>
            <div className="flex flex-1 flex-row gap-2 flex-wrap">

                {/* Date */}
                <div className="flex max-sm:w-full flex-col">
                    <label htmlFor="date">{t("createLetter.date")} *</label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-50 rounded-md border-gray-600">
                                <NepaliDatePicker {...field} value={new NepaliDate(nepToEng(field.value))} onChange={(e) => field.onChange(e!.format('YYYY-MM-DD', 'np'))} className='h-10 px-3 cursor-pointer' placeholder="YYYY-MM-DD" />
                            </div>
                        )}
                    />
                    {errors.date && <span className="text-red-500">{errors.date.message}</span>}
                </div>

                {/* Letter count */}
                <div className="flex flex-1 w-full flex-col">
                    <label htmlFor="lettercount">{t("createLetter.letter_count")} *</label>
                    <Controller
                        name="letter_count"
                        defaultValue={LetterCreationData?.fiscal_year}
                        control={control}
                        render={({ field }) => <input {...field} id="lettercount" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.letter_count && <span className="text-red-500">{errors.letter_count.message}</span>}
                </div>

                {/* Chalani No */}
                <div className="flex flex-1 w-full flex-col">
                    <label htmlFor="chalani">{t("createLetter.chalani_no")} *</label>
                    <Controller
                        name="chalani_no"
                        control={control}
                        render={({ field }) => <input {...field} id="chalani" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.chalani_no && <span className="text-red-500">{errors.chalani_no.message}</span>}
                </div>

                {/* Voucher No */}
                <div className="flex flex-1 w-full flex-col">
                    <label htmlFor="voucher_no">{t("createLetter.voucher_no")} *</label>
                    <Controller
                        name="voucher_no"
                        control={control}
                        render={({ field }) => <input {...field} id="voucher_no" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.voucher_no && <span className="text-red-500">{errors.voucher_no.message}</span>}
                </div>

                {/* GatePass No */}
                <div className="flex max-md:flex-1 max-md:w-full flex-col">
                    <label htmlFor="gatepass_no">{t("createLetter.gatepass_no")}</label>
                    <Controller
                        name="gatepass_no"
                        control={control}
                        render={({ field }) => <input {...field} id="gatepass_no" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.gatepass_no && <span className="text-red-500">{errors.gatepass_no.message}</span>}
                </div>

            </div>

            {/* Offices, Subject, Request Info */}
            <div className="flex flex-col flex-wrap gap-4">
                <div className="flex flex-row flex-1 gap-2 w-full flex-wrap">
                    <div className="flex flex-col w-full flex-1 ">
                        <label htmlFor="officeSelect">{t("createLetter.select_office")} *</label>
                        <select id="officeSelect" onChange={e => handleOfficeChange(e.target.value)} className="bg-[#B5C9DC] border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                            <option value="" hidden>{t("createLetter.select_office")}</option>
                            {Offices?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        {
                            errors.office_name && <span className="text-red-500">{errors.office_name.message}</span>
                        }
                    </div>

                    <div className="flex w-full flex-col flex-1">
                        <label htmlFor="subject">{t("createLetter.subject")} *</label>
                        <Controller
                            name="subject"
                            control={control}
                            render={({ field }) => <input {...field} id="subject" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {errors.subject && <span className="text-red-500">{errors.subject.message}</span>}
                    </div>
                </div>

                <div className="flex flex-row w-full gap-2 flex-wrap">
                    <div className="flex flex-col w-full flex-1">
                        <label htmlFor="request_date">{t("createLetter.request_date")} *</label>
                        <Controller
                            name="request_date"
                            control={control}
                            render={({ field }) => (
                                <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-50 rounded-md border-gray-600">
                                    <NepaliDatePicker {...field} value={new NepaliDate(nepToEng(field.value))} format="YYYY-MM-DD" lang="np" onChange={(e) => field.onChange(e!.format('YYYY-MM-DD', 'np'))} className='h-10 px-3 cursor-pointer' placeholder="YYYY-MM-DD" />
                                </div>
                            )}
                        />
                        {errors.request_date && <span className="text-red-500">{errors.request_date.message}</span>}
                    </div>

                    <div className="flex flex-col w-full flex-1">
                        <label htmlFor="request_chalani_number">{t("createLetter.request_chalani_number")} *</label>
                        <Controller
                            name="request_chalani_number"
                            control={control}
                            render={({ field }) => <input {...field} id="request_chalani_number" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {errors.request_chalani_number && <span className="text-red-500">{errors.request_chalani_number.message}</span>}
                    </div>

                    <div className="flex flex-col w-full flex-1">
                        <label htmlFor="request_letter_count">{t("createLetter.request_letter_count")} *</label>
                        <Controller
                            name="request_letter_count"
                            control={control}
                            render={({ field }) => <input {...field} id="request_letter_count" type="text" className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {errors.request_letter_count && <span className="text-red-500">{errors.request_letter_count.message}</span>}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="flex flex-col  gap-4 border-1 rounded-2xl p-5">
                <h2 className="font-semibold text-gray-700">{t("createLetter.items")}</h2>
                {fields.map((item, index) => (
                    <div key={item.id} className="flex  flex-col border-2 items-center p-3 rounded-2xl shadow-gray-700 gap-2">
                        <div className="flex flex-wrap gap-4 w-full">
                            <div className="flex flex-col flex-1 gap-2">
                                <label>{t("createLetter.product")} *</label>
                                <Controller
                                    name={`items.${index}.product_id`}
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            value={field.value}
                                            onChange={e => {
                                                const selected = Products?.find(p => p.id.toString() === e.target.value);
                                                if (selected) {
                                                    setValue(`items.${index}.name`, selected.name);
                                                    setValue(`items.${index}.product_id`, selected.id.toString());
                                                    setValue(`items.${index}.company`, selected.company);
                                                    setValue(`items.${index}.unit_of_measurement`, selected.unit_of_measurement);
                                                }
                                            }}
                                            className="bg-[#B5C9DC] w-full min-w-[203px] border-2 h-10 outline-none px-3 rounded-md border-gray-600"
                                        >
                                            <option value="" hidden>{t("createLetter.product")}</option>
                                            {Products?.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {
                                    errors.items && errors.items[index] && errors.items[index].name && <span className="text-red-500">{errors.items[index].name.message}</span>
                                }
                            </div>


                            <div className="flex flex-1 flex-col gap-2 ">
                                <label htmlFor="quantity">{t("createLetter.serial_number")} *</label>
                                <Controller
                                    name={`items.${index}.serial_number`}
                                    control={control}
                                    render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                                />
                                {
                                    errors.items && errors.items[index] && errors.items[index].serial_number && <span className="text-red-500">{errors.items[index].serial_number.message}</span>
                                }
                            </div>
                        </div>

                        <div className="flex flex-wrap flex-row flex-1 w-full gap-4">

                            <div className="flex flex-1 flex-col gap-2">
                                <label htmlFor="quantity">{t("createLetter.quantity")} * </label>
                                <Controller
                                    name={`items.${index}.quantity`}
                                    control={control}
                                    render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                                />
                                {
                                    errors.items && errors.items[index] && errors.items[index].quantity && <span className="text-red-500">{errors.items[index].quantity.message}</span>
                                }
                            </div>

                            <div className="flex flex-1 flex-col gap-2">
                                <label htmlFor="remarks">{t("createLetter.remarks")}</label>
                                <Controller
                                    name={`items.${index}.remarks`}
                                    control={control}
                                    render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                                />
                                {
                                    errors.items && errors.items[index] && errors.items[index].remarks && <span className="text-red-500">{errors.items[index].remarks.message}</span>
                                }
                            </div>
                        </div>

                        <button type="button" className="bg-red-500 self-end text-white px-3 rounded h-10" onClick={() => remove(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => append({product_id: "", name: "", company: "", serial_number: '', unit_of_measurement: "", quantity: '', remarks: "" })}>
                    Add Item
                </button>
            </div>

            {/* Receiver */}
            <div className="flex w-full flex-col gap-4 ">
                <div className="w-full flex gap-4  flex-wrap ">
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.select_receiver")} *</label>
                        <select id="receiverSelect" onChange={e => handleReceiverChange(e.target.value)} disabled={!filteredReceivers.length} className="bg-[#B5C9DC] border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                            <option value="" hidden>{filteredReceivers.length ? t("createLetter.select_receiver") : t("createLetter.no_receiver_found")}</option>
                            {filteredReceivers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        {
                            errors.receiver && errors.receiver.name && <span className="text-red-500">{errors.receiver.name.message}</span>
                        }
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.vehiche_number")} *</label>
                        <Controller
                            name="receiver.vehicle_number"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.vehicle_number && <span className="text-red-500">{errors.receiver.vehicle_number.message}</span>
                        }
                    </div>
                </div>
                <div className="w-full flex gap-4  flex-wrap ">
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.office_name")} *</label>
                        <Controller
                            name="receiver.office_name"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.office_name && <span className="text-red-500">{errors.receiver.office_name.message}</span>
                        }
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.receiver_office_address")} *</label>
                        <Controller
                            name="receiver.office_address"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-10 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.office_address && <span className="text-red-500">{errors.receiver.office_address.message}</span>
                        }
                    </div>
                </div>

            </div>

            {/* Submit */}
            <div className="flex mt-4">
                <button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50">
                    {isSubmitting ? t("createLetter.creating") : t("createLetter.submit")}
                </button>
            </div>
        </div>
    );
};

export default CreateLetter;
