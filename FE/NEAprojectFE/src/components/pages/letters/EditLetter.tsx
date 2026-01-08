import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useDataStore from "app/store/useDataStore";
import { useEffect, useMemo } from "react";
import type { Letter } from "app/interfaces/interfaces";
import NepaliDatePicker from "@zener/nepali-datepicker-react";
import "@zener/nepali-datepicker-react/index.css";
import api from "app/utils/api";
import { useNavigate, useParams } from "react-router";
import { updateLetterSchema, type EditLetter as EditLetterI } from "app/schemas/letter";
import { useTranslation } from "react-i18next";
import { nepToEng } from "app/utils/englishtonepaliNumber";
import { id_types } from "app/enum/id_types";
import { productUnits } from "app/enum/productUnits";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";

const EditLetterSchema = updateLetterSchema

const EditLetter = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setValue,
        reset,
        watch
    } = useForm<EditLetterI>({
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
            office_name: "",
            receiver_address: "",
            subject: "",
            request_chalani_number: "",
            request_letter_count: "",
            request_date: "",
            office_id: "",
            receiver_id: "",
        },
    });

    const { Offices, Receivers, Products, LetterCreationData, ...StoreMethods } = useDataStore();
    const officeName = watch("office_name");

    const filteredReceivers = useMemo(
        () => Receivers.filter(r => r.office_name === officeName),
        [Receivers, officeName]
    );
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        if (!Offices.length) StoreMethods.getOffices();
        if (!Receivers.length) StoreMethods.getReceivers();
        if (!Products.length) StoreMethods.getProducts();
    }, []);

    useEffect(() => {
        const fetchLetter = async () => {
            try {
                const res = await api.get(`/api/letters/${id}/`);
                if (res.status === 200) {
                    const letter: Letter = res.data.data;
                    reset({
                        ...letter,
                        receiver: {
                            ...letter.receiver,
                            id_card_type: letter.receiver.id_card_type || "unknown",
                        },
                        items: letter.items || [],
                        date: letter.date,
                        request_date: letter.request_date,
                        office_id: letter.office_id,
                        receiver_id: letter.receiver_id,
                    });
                }
            } catch (err) {
                console.error("Error fetching letter:", err);
            }
        };

            fetchLetter();
    }, []);
    const handleOfficeChange = (officeId: string) => {
        const selectedOffice = Offices?.find(
            (o) => o.id.toString() === officeId
        );
        if (selectedOffice) {
            setValue("office_id", selectedOffice.id.toString());
            setValue("office_name", selectedOffice.name);
            setValue("receiver_address", selectedOffice.address);

        }
    };

    const handleReceiverChange = (receiverId: string) => {
        const selected = Receivers?.find((r) => r.id.toString() === receiverId);
        if (selected) {
            setValue("receiver_id", selected.id.toString());
            setValue("receiver", selected);
        }
    };


    const onSubmit = async (data: EditLetterI) => {
        try {
            const res = await api.put(`/api/letters/${id}/`, data);
            if (res.status === 200) {
                navigate(`/letters/view-letter/${res.data.data.id}`);
            }
        } catch (err: AxiosError | any) {
            if (err && typeof err === 'object' && 'isAxiosError' in err) {
                const axiosErr = err as AxiosError<EditLetterI>;
                if (axiosErr.response?.data?.items?.[0]) {
                    const errObj = axiosErr.response?.data?.items?.[0]
                    const errKey = Object.keys(errObj)[0]
                    const errMsg = Object.values(errObj)[0][0]
                    toast.error(`${`${errKey}`}: ${`${errMsg}`}`)
                }
            }
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{t("createLetter.title")}</h1>
            <div className="flex flex-1 flex-row gap-2 flex-wrap">

                {/* Date */}
                <div className="flex max-sm:w-full flex-col">
                    <label htmlFor="date">{t("createLetter.date")} *</label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <div className="bg-[#B5C9DC] border-2 h-8 outline-none z-50 rounded-md border-gray-600">
                                <NepaliDatePicker {...field} value={nepToEng(field.value)} onChange={(e) => field.onChange(e!.format('YYYY-MM-DD', 'np'))} className='h-8 px-3 cursor-pointer' placeholder="YYYY-MM-DD" />

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
                        control={control}
                        render={({ field }) => <input {...field} id="lettercount" type="text" className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.letter_count && <span className="text-red-500">{errors.letter_count.message}</span>}
                </div>

                {/* Chalani No */}
                <div className="flex flex-1 w-full flex-col">
                    <label htmlFor="chalani">{t("createLetter.chalani_no")} *</label>
                    <Controller
                        name="chalani_no"
                        control={control}
                        render={({ field }) => <input {...field} id="chalani" type="text" className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.chalani_no && <span className="text-red-500">{errors.chalani_no.message}</span>}
                </div>

                {/* Voucher No */}
                <div className="flex flex-1 w-full flex-col">
                    <label htmlFor="voucher_no">{t("createLetter.voucher_no")} *</label>
                    <Controller
                        name="voucher_no"
                        control={control}
                        render={({ field }) => <input {...field} id="voucher_no" type="text" className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.voucher_no && <span className="text-red-500">{errors.voucher_no.message}</span>}
                </div>

                {/* GatePass No */}
                <div className="flex max-md:flex-1 max-md:w-full flex-col">
                    <label htmlFor="gatepass_no">{t("createLetter.gatepass_no")}</label>
                    <Controller
                        name="gatepass_no"
                        control={control}
                        render={({ field }) => <input {...field} id="gatepass_no" type="text" className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                    />
                    {errors.gatepass_no && <span className="text-red-500">{errors.gatepass_no.message}</span>}
                </div>

            </div>

            {/* Offices, Subject, Request Info */}
            <div className="flex flex-col flex-wrap gap-4">
                <div className="flex flex-row flex-1 gap-2 w-full flex-wrap">
                    <div className="flex flex-col w-full flex-1 ">
                        <label htmlFor="officeSelect">{t("createLetter.select_office")} *</label>

                        <Controller
                            name="office_id"
                            control={control}
                            render={({ field }) => (
                                <div className="flex w-full items-center relative">
                                    <select id="position" {...field} onChange={(e) => { handleOfficeChange(e.target.value) }} className="bg-[#B5C9DC] w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                        <option value="" hidden>{t("createLetter.select_office")}</option>
                                        {Offices?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                </div>
                            )
                            }
                        />
                        {
                            errors.office_name && <span className="text-red-500">{errors.office_name.message}</span>
                        }
                    </div>

                    <div className="flex w-full flex-col flex-1">
                        <label htmlFor="subject">{t("createLetter.subject")} *</label>
                        <Controller
                            name="subject"
                            control={control}
                            render={({ field }) => <input {...field} id="subject" type="text" className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600" />}
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
                                <div className="bg-[#B5C9DC] border-2 h-8 outline-none z-50 rounded-md border-gray-600">
                                    <NepaliDatePicker {...field} value={nepToEng(field.value)} format="YYYY-MM-DD" lang="np" onChange={(e) => field.onChange(e!.format('YYYY-MM-DD', 'np'))} className='h-8 px-3 cursor-pointer' placeholder="YYYY-MM-DD" />
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
                            render={({ field }) => <input {...field} id="request_chalani_number" type="text" className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {errors.request_chalani_number && <span className="text-red-500">{errors.request_chalani_number.message}</span>}
                    </div>

                    <div className="flex flex-col w-full flex-1">
                        <label htmlFor="request_letter_count">{t("createLetter.request_letter_count")} *</label>
                        <Controller
                            name="request_letter_count"
                            control={control}
                            render={({ field }) => <input {...field} id="request_letter_count" type="text" className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {errors.request_letter_count && <span className="text-red-500">{errors.request_letter_count.message}</span>}
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3 rounded-2xl p-5">
                <div className="flex flex-col rounded-2xl p-2 bg-[#91a4c3]">
                    <div className="flex p-2 w-full ">
                        <div className="flex-1 pl-3">Product</div>
                        <div className="flex  flex-2 justify-between" >
                            <div className="flex-1 pl-3 max-w-[30%]">Unit</div>
                            <div className="flex-1 pl-3 flex-row flex justify-between ">
                                <div className="flex-1 pl-3 flex max-w-[66%] ">Serial number</div>
                                <div className="flex-1 pl-3 flex max-w-[30%] ">Quantity</div>
                            </div>
                        </div>
                        <div className="flex-1 pl-3">Remarks</div>
                        <button type="button" className="self-end  px-3 w-24 "></button>

                    </div>
                    {fields.map((item, index) => (
                        <div key={item.id} className="flex flex-wrap items-center p-2 rounded-2xl shadow-gray-700 gap-2">
                            <div className="flex flex-col flex-1 gap-2">
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
                                            className="bg-[#B5C9DC] w-full min-w-[203px] border-2 h-8 outline-none px-3 rounded-md border-gray-600"
                                        >
                                            <option value="" hidden>{t("createLetter.product")}</option>
                                            {Products?.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {
                                    errors.items && errors.items[index] && errors.items[index].name && <span className="text-[#B22222]">{errors.items[index].name.message}</span>
                                }
                            </div>
                            <div className="flex flex-2 gap-2 justify-between" >

                                <div className="flex max-w-[30%] flex-col flex-1 gap-2">
                                    <Controller
                                        name={`items.${index}.unit_of_measurement`}
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                value={field.value}
                                                onChange={e => {
                                                    setValue(`items.${index}.unit_of_measurement`, e.target.value);
                                                }}
                                                className="bg-[#B5C9DC] w-full border-2 h-8 outline-none px-3 rounded-md border-gray-600"
                                            >
                                                <option value="" hidden>{t("createLetter.unit")}</option>
                                                {productUnits?.map(p => (
                                                    <option key={p.id} value={p.value}>{p.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {
                                        errors.items && errors.items[index] && errors.items[index].name && <span className="text-[#B22222]">{errors.items[index].name.message}</span>
                                    }
                                </div>

                                <div className="flex flex-1 flex-wrap justify-between  flex-row gap-2" >
                                    <div className={'  flex-col flex-2 max-w-[66%] flex'} >
                                        <Controller
                                            name={`items.${index}.serial_number`}
                                            control={control}
                                            render={({ field }) =>
                                                <input
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value);
                                                        const trimmed = value.trim();
                                                        if (trimmed === "" || trimmed === "-") {
                                                            return;
                                                        }
                                                        const count = trimmed.split(",").map(s => s.trim()).filter(Boolean).length;
                                                        setValue(`items.${index}.quantity`, String(count));
                                                    }}
                                                    type="text"
                                                    className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                                                />
                                            }
                                        />
                                        {
                                            errors.items && errors.items[index] && errors.items[index].serial_number && <span className="text-[#B22222]">{errors.items[index].serial_number.message}</span>
                                        }
                                    </div>
                                    <div className="flex max-w-[30%] flex-1 flex-col gap-2">
                                        <Controller
                                            name={`items.${index}.quantity`}
                                            control={control}
                                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                                        />
                                        {
                                            errors.items && errors.items[index] && errors.items[index].quantity && <span className="text-[#B22222]">{errors.items[index].quantity.message}</span>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col gap-2">
                                <Controller
                                    name={`items.${index}.remarks`}
                                    control={control}
                                    render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                                />
                                {
                                    errors.items && errors.items[index] && errors.items[index].remarks && <span className="text-[#B22222]">{errors.items[index].remarks.message}</span>
                                }
                            </div>
                            <button type="button" className="bg-red-500 self-end text-white shadow px-3 rounded-xl border-1 border-black h-8" onClick={() => remove(index)}>Remove</button>
                        </div>
                    ))}
                </div>

                <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => append({ product_id: "", name: "", company: "", serial_number: '', unit_of_measurement: "", quantity: '', remarks: "" })}>
                    Add Item
                </button>
            </div>

            {/* Receiver */}
            <div className="flex w-full flex-col gap-2 ">
                <div className="w-full flex gap-4  flex-wrap ">
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.select_receiver")} *</label>
                        <Controller
                            name="receiver_id"
                            control={control}
                            render={({ field }) => (
                                <div className="flex w-full items-center relative">
                                    <select id="receiverSelect"  {...field} onChange={e => { handleReceiverChange(e.target.value) }} disabled={!filteredReceivers.length} className="bg-[#B5C9DC] border-2 h-8 flex-1 outline-none px-3 rounded-md border-gray-600">
                                        <option value="" hidden>{filteredReceivers.length ? t("createLetter.select_receiver") : t("createLetter.no_receiver_found")}</option>
                                        {filteredReceivers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                            )
                            }
                        />
                        {
                            errors.receiver && errors.receiver.name && <span className="text-red-500">{errors.receiver.name.message}</span>
                        }
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.vehiche_number")} *</label>
                        <Controller
                            name="receiver.vehicle_number"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.vehicle_number && <span className="text-red-500">{errors.receiver.vehicle_number.message}</span>
                        }
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.post")} *</label>
                        <Controller
                            name="receiver.post"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.post && <span className="text-red-500">{errors.receiver.post.message}</span>
                        }
                    </div>
                </div>
                <div className="w-full flex gap-4  flex-wrap ">

                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.office_name")} *</label>
                        <Controller
                            name="receiver.office_name"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
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
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.office_address && <span className="text-red-500">{errors.receiver.office_address.message}</span>
                        }
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.phone_number")} *</label>
                        <Controller
                            name="receiver.phone_number"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.office_address && <span className="text-red-500">{errors.receiver.office_address.message}</span>
                        }
                    </div>
                </div>
                <div className="w-full flex gap-4  flex-wrap ">
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.id_card_number")} *</label>
                        <Controller
                            name="receiver.id_card_number"
                            control={control}
                            render={({ field }) => <input {...field} type="text" className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600" />}
                        />
                        {
                            errors.receiver && errors.receiver.office_address && <span className="text-red-500">{errors.receiver.office_address.message}</span>
                        }
                    </div>
                    <div className="flex flex-col flex-1">
                        <label htmlFor="receiverSelect">{t("createLetter.id_card_type")} *</label>
                        <Controller
                            name="receiver.id_card_type"
                            control={control}
                            render={({ field }) => (
                                <div className="flex w-full items-center relative">
                                    <select id="position" {...field} className="bg-[#B5C9DC] w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                                        {
                                            id_types.map((idType) => (
                                                <option key={idType.id} value={idType.value}>{idType.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )
                            }
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
                    {isSubmitting ? t("editLetter.updating") : t("editLetter.update")}
                </button>
            </div>
        </div>
    );
};

export default EditLetter;
