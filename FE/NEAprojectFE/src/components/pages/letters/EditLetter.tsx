import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useDataStore from "app/store/useDataStore";
import { useEffect, useState } from "react";
import type { Letter } from "app/interfaces/interfaces";
import NepaliDatePicker from "@zener/nepali-datepicker-react";
import "@zener/nepali-datepicker-react/index.css";
import api from "app/utils/api";
import { useNavigate, useParams } from "react-router";
import {
  updateLetterSchema,
  type EditLetter as EditLetterI,
} from "app/schemas/letter";
import { useTranslation } from "react-i18next";
import { nepToEng } from "app/utils/englishtonepaliNumber";
import { id_types } from "app/enum/id_types";
import { productUnits } from "app/enum/productUnits";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";

interface ReceiverEntry {
  id: string;
  name: string;
  post: string;
  id_card_number: string;
  id_card_type: string;
  office_name: string;
  office_address: string;
  phone_number: string;
  vehicle_number: string;
  isManual: boolean;
}

const EditLetterSchema = updateLetterSchema;

const EditLetter = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState,
    setValue,
    reset,
    trigger,
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

  const { Offices, Products, Receivers, ...StoreMethods } =
    useDataStore();

  const [selectedReceivers, setSelectedReceivers] = useState<ReceiverEntry[]>([]);
  const [editingReceiverId, setEditingReceiverId] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualReceiver, setManualReceiver] = useState<ReceiverEntry>({
    id: "",
    name: "",
    post: "",
    id_card_number: "",
    id_card_type: "unknown",
    office_name: "",
    office_address: "",
    phone_number: "",
    vehicle_number: "",
    isManual: true,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (!Offices.length) StoreMethods.getOffices();
    if (!Products.length) StoreMethods.getProducts();
    StoreMethods.getReceivers();
  }, [
    Offices.length,
    StoreMethods.getProducts,
    StoreMethods.getOffices,
    StoreMethods.getReceivers,
    Products.length,
  ]);

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

          const receiver = letter.receiver;
          if (receiver?.name) {
            const names = receiver.name.split(", ").filter(Boolean);
            const posts = receiver.post ? receiver.post.split(", ").filter(Boolean) : [];
            const idCardNumbers = receiver.id_card_number ? receiver.id_card_number.split(", ").filter(Boolean) : [];
            const officeNames = receiver.office_name ? receiver.office_name.split(", ").filter(Boolean) : [];
            const officeAddresses = receiver.office_address ? receiver.office_address.split(", ").filter(Boolean) : [];
            const phoneNumbers = receiver.phone_number ? receiver.phone_number.split(", ").filter(Boolean) : [];
            const vehicleNumbers = receiver.vehicle_number ? receiver.vehicle_number.split(", ").filter(Boolean) : [];

            const parsedReceivers: ReceiverEntry[] = names.map((name, index) => ({
              id: `existing-${index}`,
              name: name.trim(),
              post: posts[index]?.trim() || "",
              id_card_number: idCardNumbers[index]?.trim() || "",
              id_card_type: receiver.id_card_type || "unknown",
              office_name: officeNames[index]?.trim() || "",
              office_address: officeAddresses[index]?.trim() || "",
              phone_number: phoneNumbers[index]?.trim() || "",
              vehicle_number: vehicleNumbers[index]?.trim() || "",
              isManual: false,
            }));

            setSelectedReceivers(parsedReceivers);
          }
        }
      } catch (err) {
        console.error("Error fetching letter:", err);
        toast.error("पत्र प्राप्त गर्नमा त्रुटि भयो");
      }
    };

    fetchLetter();
  }, [id, reset]);

  const handleOfficeChange = (officeId: string) => {
    const selectedOffice = Offices?.find((o) => o.id.toString() === officeId);
    if (selectedOffice) {
      setValue("office_id", selectedOffice.id.toString());
      setValue("office_name", selectedOffice.name);
      setValue("receiver_address", selectedOffice.address);
    }
    trigger("office_id");
  };

  const handleReceiverChange = (receiverId: string) => {
    const selected = Receivers?.find((r) => r.id.toString() === receiverId);
    if (selected) {
      const newReceiver: ReceiverEntry = {
        id: selected.id.toString(),
        name: selected.name,
        post: selected.post,
        id_card_number: selected.id_card_number,
        id_card_type: selected.id_card_type,
        office_name: selected.office_name,
        office_address: selected.office_address,
        phone_number: selected.phone_number,
        vehicle_number: selected.vehicle_number,
        isManual: false,
      };
      if (!selectedReceivers.find((r) => r.id === newReceiver.id)) {
        setSelectedReceivers([...selectedReceivers, newReceiver]);
      }
      setValue("receiver_id", selected.id.toString());
      setValue("receiver.name", selected.name);
      setValue("receiver.post", selected.post);
      setValue("receiver.id_card_number", selected.id_card_number);
      setValue("receiver.id_card_type", selected.id_card_type);
      setValue("receiver.phone_number", selected.phone_number);
      setValue("receiver.vehicle_number", selected.vehicle_number);
      setValue("receiver.office_name", selected.office_name);
      setValue("receiver.office_address", selected.office_address);
    }
    trigger("receiver");
  };

  const handleRemoveReceiver = (id: string) => {
    setSelectedReceivers(selectedReceivers.filter((r) => r.id !== id));
  };

  const handleEditReceiver = (id: string) => {
    setEditingReceiverId(id);
    const receiver = selectedReceivers.find((r) => r.id === id);
    if (receiver) {
      setManualReceiver({ ...receiver, isManual: true });
    }
  };

  const handleSaveEditedReceiver = () => {
    if (editingReceiverId) {
      setSelectedReceivers(
        selectedReceivers.map((r) =>
          r.id === editingReceiverId ? { ...manualReceiver, id: editingReceiverId } : r
        )
      );
      setEditingReceiverId(null);
      setManualReceiver({
        id: "",
        name: "",
        post: "",
        id_card_number: "",
        id_card_type: "unknown",
        office_name: "",
        office_address: "",
        phone_number: "",
        vehicle_number: "",
        isManual: true,
      });
    }
  };

  const handleAddManualReceiver = () => {
    if (manualReceiver.name && manualReceiver.post && manualReceiver.phone_number) {
      const newReceiver: ReceiverEntry = {
        ...manualReceiver,
        id: `manual-${Date.now()}`,
      };
      setSelectedReceivers([...selectedReceivers, newReceiver]);
      setManualReceiver({
        id: "",
        name: "",
        post: "",
        id_card_number: "",
        id_card_type: "unknown",
        office_name: "",
        office_address: "",
        phone_number: "",
        vehicle_number: "",
        isManual: true,
      });
    } else {
      toast.error("कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्");
    }
  };

  const handleSubmitWrapper = () => {
    // Validate selectedReceivers have all required fields before submitting
    const validReceivers = selectedReceivers.filter((r) => r.name.trim());

    if (validReceivers.length === 0) {
      toast.error("कृपया कम्तीमा एक प्राप्तकर्ता चयन गर्नुहोस्");
      return;
    }

    // Check each receiver for missing required fields
    const missingFields: string[] = [];
    for (let i = 0; i < validReceivers.length; i++) {
      const r = validReceivers[i];
      const label = `प्राप्तकर्ता ${i + 1} (${r.name || "?"})`;
      if (!r.post.trim()) missingFields.push(`${label}: पद आवश्यक छ`);
      if (!r.id_card_number.trim()) missingFields.push(`${label}: परिचयपत्र नं आवश्यक छ`);
      if (!r.office_name.trim()) missingFields.push(`${label}: कार्यालयको नाम आवश्यक छ`);
      if (!r.office_address.trim()) missingFields.push(`${label}: कार्यालयको ठेगाना आवश्यक छ`);
      if (!r.phone_number.trim()) missingFields.push(`${label}: फोन नं आवश्यक छ`);
      if (!r.vehicle_number.trim()) missingFields.push(`${label}: सवारी नं आवश्यक छ`);
    }

    if (missingFields.length > 0) {
      toast.error(missingFields[0]);
      return;
    }

    // Sync selectedReceivers into the form's receiver field before validation
    setValue("receiver.name", validReceivers.map((r) => r.name).join(", "));
    setValue("receiver.post", validReceivers.map((r) => r.post).join(", "));
    setValue("receiver.id_card_number", validReceivers.map((r) => r.id_card_number).join(", "));
    setValue("receiver.id_card_type", (validReceivers[0]?.id_card_type || "unknown") as EditLetterI["receiver"]["id_card_type"]);
    setValue("receiver.office_name", validReceivers.map((r) => r.office_name).join(", "));
    setValue("receiver.office_address", validReceivers.map((r) => r.office_address).join(", "));
    setValue("receiver.phone_number", validReceivers.map((r) => r.phone_number).join(", "));
    setValue("receiver.vehicle_number", validReceivers.map((r) => r.vehicle_number).join(", "));

    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: EditLetterI) => {
    const validReceivers = selectedReceivers.filter((r) => r.name.trim());
    if (validReceivers.length === 0) {
      toast.error("कृपया कम्तीमा एक प्राप्तकर्ता चयन गर्नुहोस्");
      return;
    }

    const combinedData = {
      ...data,
      receiver: {
        name: validReceivers.map((r) => r.name).join(", "),
        post: validReceivers.map((r) => r.post).join(", "),
        id_card_number: validReceivers.map((r) => r.id_card_number).join(", "),
        id_card_type: validReceivers[0]?.id_card_type || "unknown",
        office_name: validReceivers.map((r) => r.office_name).join(", "),
        office_address: validReceivers.map((r) => r.office_address).join(", "),
        phone_number: validReceivers.map((r) => r.phone_number).join(", "),
        vehicle_number: validReceivers.map((r) => r.vehicle_number).join(", "),
      },
    };

    try {
      const res = await api.put(`/api/letters/${id}/`, combinedData);
      if (res.status === 200) {
        toast.success(t("editLetter.success_message") || "पत्र सफलतापूर्वक अपडेट भयो", {
          position: "top-center",
          duration: 1000,
          removeDelay: 1000,
        });
        navigate(`/letters/view-letter/${res.data.data.id}`);
      }
    } catch (err: unknown) {
      console.error("Error updating letter:", err);
      if (err && typeof err === "object" && "isAxiosError" in err) {
        const axiosErr = err as AxiosError<EditLetterI>;
        if (axiosErr.response?.data?.items?.[0]) {
          const errObj = axiosErr.response?.data?.items?.[0];
          const errKey = Object.keys(errObj)[0];
          const errMsg = Object.values(errObj)[0][0];
          toast.error(`${`${errKey}`}: ${`${errMsg}`}`);
          return;
        }
        const message = axiosErr.response?.data as { message?: string };
        if (message?.message) {
          toast.error(message.message);
          return;
        }
      }
      toast.error(t("editLetter.error_message") || "केही गलत भयो");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("createLetter.title")}
      </h1>
      <div className="flex flex-1 flex-row gap-2 flex-wrap">
        {/* Date */}
        <div className="flex max-sm:w-full flex-col">
          <label htmlFor="date">{t("createLetter.date")} *</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <div className="bg-[#B5C9DC] border-2 h-8 outline-none z-50 rounded-md border-gray-600">
                <NepaliDatePicker
                  {...field}
                  value={nepToEng(field.value)}
                  onChange={(e) =>
                    field.onChange(e?.format("YYYY-MM-DD", "np"))
                  }
                  className="h-8 px-3 cursor-pointer"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            )}
          />
          {formState.errors.date && (
            <span className="text-red-500">{formState.errors.date.message}</span>
          )}
        </div>

        {/* Letter count */}
        <div className="flex flex-1 w-full flex-col">
          <label htmlFor="lettercount">
            {t("createLetter.letter_count")} *
          </label>
          <Controller
            name="letter_count"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="lettercount"
                type="text"
                className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            )}
          />
          {formState.errors.letter_count && (
            <span className="text-red-500">{formState.errors.letter_count.message}</span>
          )}
        </div>

        {/* Chalani No */}
        <div className="flex flex-1 w-full flex-col">
          <label htmlFor="chalani">{t("createLetter.chalani_no")} *</label>
          <Controller
            name="chalani_no"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="chalani"
                type="text"
                className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            )}
          />
          {formState.errors.chalani_no && (
            <span className="text-red-500">{formState.errors.chalani_no.message}</span>
          )}
        </div>

        {/* Voucher No */}
        <div className="flex flex-1 w-full flex-col">
          <label htmlFor="voucher_no">{t("createLetter.voucher_no")} *</label>
          <Controller
            name="voucher_no"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="voucher_no"
                type="text"
                className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            )}
          />
          {formState.errors.voucher_no && (
            <span className="text-red-500">{formState.errors.voucher_no.message}</span>
          )}
        </div>

        {/* GatePass No */}
        <div className="flex max-md:flex-1 max-md:w-full flex-col">
          <label htmlFor="gatepass_no">{t("createLetter.gatepass_no")}</label>
          <Controller
            name="gatepass_no"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="gatepass_no"
                type="text"
                className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            )}
          />
          {formState.errors.gatepass_no && (
            <span className="text-red-500">{formState.errors.gatepass_no.message}</span>
          )}
        </div>
      </div>

      {/* Offices, Subject, Request Info */}
      <div className="flex flex-col flex-wrap gap-4">
        <div className="flex flex-row flex-1 gap-2 w-full flex-wrap">
          <div className="flex flex-col w-full flex-1 ">
            <label htmlFor="officeSelect">
              {t("createLetter.select_office")} *
            </label>

            <Controller
              name="office_id"
              control={control}
              render={({ field }) => (
                <div className="flex w-full items-center relative">
                  <select
                    id="position"
                    {...field}
                    onChange={(e) => {
                      handleOfficeChange(e.target.value);
                    }}
                    className="bg-[#B5C9DC] w-full border-2 h-8 outline-none px-3 rounded-md border-gray-600"
                  >
                    <option value="" hidden>
                      {t("createLetter.select_office")}
                    </option>
                    {Offices?.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
            {formState.errors.office_name && (
              <span className="text-red-500">{formState.errors.office_name.message}</span>
            )}
          </div>

          <div className="flex w-full flex-col flex-1">
            <label htmlFor="subject">{t("createLetter.subject")} *</label>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="subject"
                  type="text"
                  className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                />
              )}
            />
            {formState.errors.subject && (
              <span className="text-red-500">{formState.errors.subject.message}</span>
            )}
          </div>
        </div>

        <div className="flex flex-row w-full gap-2 flex-wrap">
          <div className="flex flex-col w-full flex-1">
            <label htmlFor="request_date">
              {t("createLetter.request_date")} *
            </label>
            <Controller
              name="request_date"
              control={control}
              render={({ field }) => (
                <div className="bg-[#B5C9DC] border-2 h-8 outline-none z-50 rounded-md border-gray-600">
                  <NepaliDatePicker
                    {...field}
                    value={nepToEng(field.value)}
                    format="YYYY-MM-DD"
                    lang="np"
                    onChange={(e) =>
                      field.onChange(e?.format("YYYY-MM-DD", "np"))
                    }
                    className="h-8 px-3 cursor-pointer"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              )}
            />
            {formState.errors.request_date && (
              <span className="text-red-500">
                {formState.errors.request_date.message}
              </span>
            )}
          </div>

          <div className="flex flex-col w-full flex-1">
            <label htmlFor="request_chalani_number">
              {t("createLetter.request_chalani_number")} *
            </label>
            <Controller
              name="request_chalani_number"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="request_chalani_number"
                  type="text"
                  className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                />
              )}
            />
            {formState.errors.request_chalani_number && (
              <span className="text-red-500">
                {formState.errors.request_chalani_number.message}
              </span>
            )}
          </div>

          <div className="flex flex-col w-full flex-1">
            <label htmlFor="request_letter_count">
              {t("createLetter.request_letter_count")} *
            </label>
            <Controller
              name="request_letter_count"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="request_letter_count"
                  type="text"
                  className="bg-[#B5C9DC] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                />
              )}
            />
            {formState.errors.request_letter_count && (
              <span className="text-red-500">
                {formState.errors.request_letter_count.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3 rounded-2xl p-5">
        <div className="flex flex-col rounded-2xl p-2 bg-[#91a4c3]">
          <div className="flex p-2 w-full ">
            <div className="flex-1 pl-3">{t("createLetter.product")}</div>
            <div className="flex  flex-2 justify-between">
              <div className="flex-1 pl-3 max-w-[30%]">{t("createLetter.unit")}</div>
              <div className="flex-1 pl-3 flex-row flex justify-between ">
                <div className="flex-1 pl-3 flex max-w-[66%] ">
                  {t("createLetter.serial_number")}
                </div>
                <div className="flex-1 pl-3 flex max-w-[30%] ">{t("createLetter.quantity")}</div>
              </div>
            </div>
            <div className="flex-1 pl-3">{t("createLetter.remarks")}</div>
            <button type="button" className="self-end  px-3 w-24 "></button>
          </div>
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center p-2 rounded-2xl shadow-gray-700 gap-2"
            >
              <div className="flex flex-col flex-1 gap-2">
                <Controller
                  name={`items.${index}.product_id`}
                  control={control}
                  render={({ field }) => {
                    // const items = watch(`items.${index}`);
                    return (
                    <select
                      {...field}
                      value={field.value}
                      onChange={async (e) => {
                        const selected = Products?.find(
                          (p) => p.id.toString() === e.target.value,
                        );
                        if (selected) {
                          setValue(`items.${index}.name`, selected.name, { shouldValidate: true });
                          setValue(
                            `items.${index}.product_id`,
                            selected.id.toString(),
                          );
                          setValue(`items.${index}.company`, selected.company);
                          setValue(
                            `items.${index}.unit_of_measurement`,
                            selected.unit_of_measurement,
                            { shouldValidate: true },
                          );
                          await trigger([`items.${index}.name`, `items.${index}.unit_of_measurement`]);
                        }
                      }}
                      className={`bg-[#B5C9DC] w-full min-w-[203px] border-2 h-8 outline-none px-3 rounded-md ${formState.errors.items?.[index]?.name ? 'border-red-500' : 'border-gray-600'}`}
                    >
                      <option value="" hidden>
                        {t("createLetter.product")}
                      </option>
                      {Products?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    );
                  }}
                />
              </div>
              <div className="flex flex-2 gap-2 justify-between">
                <div className="flex max-w-[30%] flex-col flex-1 gap-2">
                  <Controller
                    name={`items.${index}.unit_of_measurement`}
                    control={control}
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={(e) => {
                          setValue(
                            `items.${index}.unit_of_measurement`,
                            e.target.value,
                            {
                              shouldValidate: true,
                            },
                          );
                          trigger(`items.${index}.unit_of_measurement`);
                        }}
                        className={`bg-[#B5C9DC] w-full border-2 h-8 outline-none px-3 rounded-md ${formState.errors.items?.[index]?.unit_of_measurement ? 'border-red-500' : 'border-gray-600'}`}
                      >
                        <option value="" hidden>
                          {t("createLetter.unit")}
                        </option>
                        {productUnits?.map((p) => (
                          <option key={p.id} value={p.value}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
              </div>

                <div className="flex flex-1 flex-wrap justify-between  flex-row gap-2">
                  <div className={"  flex-col flex-2 max-w-[66%] flex"}>
                    <Controller
                      name={`items.${index}.serial_number`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          onChange={async (e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            const trimmed = value.trim();
                            if (trimmed === "" || trimmed === "-") {
                              await trigger(`items.${index}.serial_number`);
                              return;
                            }
                            const count = trimmed
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean).length;
                            setValue(`items.${index}.quantity`, String(count), {
                              shouldValidate: true,
                            });
                            await trigger([
                              `items.${index}.serial_number`,
                              `items.${index}.quantity`,
                            ]);
                          }}
                          type="text"
                          className={`bg-[#B5C9DC] border-1 h-auto min-h-[2rem] max-h-20 overflow-y-auto outline-none pl-3 rounded-md ${fieldState.error ? 'border-red-500 border-2' : 'border-gray-600'} resize-y py-1`}
                        />
                      )}
                    />
                  </div>
                  <div className="flex max-w-[30%] flex-1 flex-col gap-2">
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      render={({ field, fieldState }) => (
                        <input
                          {...field}
                          onChange={async (e) => {
                            field.onChange(e);
                            await trigger(`items.${index}.quantity`);
                          }}
                          type="text"
                          className={`bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md ${fieldState.error ? 'border-red-500 border-2' : 'border-gray-600'}`}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Controller
                  name={`items.${index}.remarks`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                    />
                  )}
                />
              </div>
              <button
                type="button"
                className="bg-red-500 self-end text-white shadow px-3 rounded-xl border-1 border-black h-8"
                onClick={() => remove(index)}
              >
                {t("createLetter.remove")}
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          // onClick={() => append({ product_id: "", name: "", company: "", serial_number: '', unit_of_measurement: "", quantity: '', remarks: "" })
          onClick={async () => {
            const lastIndex = fields.length - 1;

            const isValid = await trigger([
              `items.${lastIndex}.product_id`,
              `items.${lastIndex}.name`,
              `items.${lastIndex}.unit_of_measurement`,
              `items.${lastIndex}.serial_number`,
              `items.${lastIndex}.quantity`,
            ]);

            if (!isValid) {
              toast.error("माथिको सामान पूरा भर्नुहोस्");
              return;
            }

            append({
              product_id: "",
              name: "",
              company: "",
              serial_number: "",
              unit_of_measurement: "",
              quantity: "",
              remarks: "",
            });
          }}
        >
          {t("createLetter.add_item")}{" "}
        </button>
      </div>

      {/* Receiver */}
      {(() => {
        const availableReceivers = Receivers;
        return (
          <div className="flex w-full flex-col gap-2">
            {/* Dropdown to select receiver */}
            <div className="w-full flex gap-4 flex-wrap">
              <div className="flex flex-col flex-1">
                <label htmlFor="receiverSelect">
                  {t("createLetter.select_receiver")}
                </label>
                <select
                  id="receiverSelect"
                  onChange={(e) => handleReceiverChange(e.target.value)}
                  disabled={!availableReceivers.length}
                  className="bg-[#B5C9DC] border-2 h-8 outline-none px-3 rounded-md border-gray-600"
                >
                  <option value="" hidden>
                    {availableReceivers.length
                      ? t("createLetter.select_receiver")
                      : t("createLetter.no_receiver_found")}
                  </option>
                  {availableReceivers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected receivers list */}
            {selectedReceivers.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                <div className="bg-[#90a3c2] px-4 py-2 rounded-t-md font-semibold text-black">
                  {t("createLetter.selected_receivers") || "चयनित प्राप्तकर्ताहरू"}{" "}
                  ({selectedReceivers.length})
                </div>
                {selectedReceivers.map((receiver, index) => (
                  <div
                    key={receiver.id}
                    className="bg-[#90a3c2] px-4 py-3 flex flex-col gap-2"
                  >
                    {editingReceiverId === receiver.id ? (
                      /* Edit mode */
                      <div className="flex flex-col gap-2 w-full">
                        <div className="w-full flex gap-4 flex-wrap">
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-name">
                              {t("createLetter.manual_receiver_name")}
                            </label>
                            <input
                              id="edit-name"
                              type="text"
                              value={manualReceiver.name}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  name: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-post">
                              {t("createLetter.post")}
                            </label>
                            <input
                              id="edit-post"
                              type="text"
                              value={manualReceiver.post}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  post: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-vehicle">
                              {t("createLetter.vehiche_number")}
                            </label>
                            <input
                              id="edit-vehicle"
                              type="text"
                              value={manualReceiver.vehicle_number}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  vehicle_number: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="w-full flex gap-4 flex-wrap">
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-office">
                              {t("createLetter.office_name")}
                            </label>
                            <input
                              id="edit-office"
                              type="text"
                              value={manualReceiver.office_name}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  office_name: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-address">
                              {t("createLetter.receiver_office_address")}
                            </label>
                            <input
                              id="edit-address"
                              type="text"
                              value={manualReceiver.office_address}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  office_address: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-phone">
                              {t("createLetter.phone_number")}
                            </label>
                            <input
                              id="edit-phone"
                              type="text"
                              value={manualReceiver.phone_number}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  phone_number: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="w-full flex gap-4 flex-wrap">
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-idcard">
                              {t("createLetter.id_card_number")}
                            </label>
                            <input
                              id="edit-idcard"
                              type="text"
                              value={manualReceiver.id_card_number}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  id_card_number: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                            />
                          </div>
                          <div className="flex flex-col flex-1">
                            <label htmlFor="edit-idtype">
                              {t("createLetter.id_card_type")}
                            </label>
                            <select
                              id="edit-idtype"
                              value={manualReceiver.id_card_type}
                              onChange={(e) =>
                                setManualReceiver({
                                  ...manualReceiver,
                                  id_card_type: e.target.value,
                                })
                              }
                              className="bg-[#b4c8db] border-2 h-8 outline-none px-3 rounded-md border-gray-600"
                            >
                              {id_types.map((idType) => (
                                <option key={idType.id} value={idType.value}>
                                  {idType.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-1"></div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={handleSaveEditedReceiver}
                            className="bg-[#10172A] text-white px-4 py-1.5 rounded-md hover:bg-[#233058] text-sm"
                          >
                            {t("createLetter.save")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReceiverId(null);
                              setManualReceiver({
                                id: "",
                                name: "",
                                post: "",
                                id_card_number: "",
                                id_card_type: "unknown",
                                office_name: "",
                                office_address: "",
                                phone_number: "",
                                vehicle_number: "",
                                isManual: true,
                              });
                            }}
                            className="bg-gray-500 text-white px-4 py-1.5 rounded-md hover:bg-gray-600 text-sm"
                          >
                            {t("createLetter.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display mode */
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#10172A]">
                              {index + 1}. {receiver.name} ({receiver.post})
                            </span>
                            <span className="text-sm text-[#10172A]">
                              {receiver.office_name}, {receiver.office_address}
                            </span>
                            <span className="text-sm text-[#10172A]">
                              {receiver.phone_number} |{" "}
                              {receiver.vehicle_number}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditReceiver(receiver.id)}
                              className="bg-[#10172A] text-white px-3 py-1 rounded-md hover:bg-[#233058] text-sm"
                            >
                              {t("createLetter.edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveReceiver(receiver.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                            >
                              {t("createLetter.remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Manual entry button */}
            {!editingReceiverId && (
              <button
                type="button"
                onClick={() => setShowManualEntry(true)}
                className="bg-[#91a4c3] text-black px-4 py-2 rounded-md hover:bg-[#7a8dab] w-fit"
              >
                +{" "}
                {t("createLetter.add_manual_receiver") ||
                  "म्यानुअल प्राप्तकर्ता थप्नुहोस्"}
              </button>
            )}

            {/* Manual entry form */}
            {showManualEntry && !editingReceiverId && (
              <div className="flex flex-col gap-2 w-full mt-2">
                <div className="bg-[#91a4c3] px-4 py-2 rounded-t-md font-semibold text-black">
                  {t("createLetter.add_manual_receiver") ||
                    "म्यानुअल प्राप्तकर्ता थप्नुहोस्"}
                </div>
                <div className="bg-[#B5C9DC] px-4 py-3 rounded-b-md flex flex-col gap-2">
                  <div className="w-full flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-name">
                        {t("createLetter.manual_receiver_name")}
                      </label>
                      <input
                        id="manual-name"
                        type="text"
                        value={manualReceiver.name}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            name: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-post">
                        {t("createLetter.post")}
                      </label>
                      <input
                        id="manual-post"
                        type="text"
                        value={manualReceiver.post}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            post: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-vehicle">
                        {t("createLetter.vehiche_number")}
                      </label>
                      <input
                        id="manual-vehicle"
                        type="text"
                        value={manualReceiver.vehicle_number}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            vehicle_number: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                      />
                    </div>
                  </div>
                  <div className="w-full flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-office">
                        {t("createLetter.office_name")}
                      </label>
                      <input
                        id="manual-office"
                        type="text"
                        value={manualReceiver.office_name}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            office_name: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-address">
                        {t("createLetter.receiver_office_address")}
                      </label>
                      <input
                        id="manual-address"
                        type="text"
                        value={manualReceiver.office_address}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            office_address: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-phone">
                        {t("createLetter.phone_number")}
                      </label>
                      <input
                        id="manual-phone"
                        type="text"
                        value={manualReceiver.phone_number}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            phone_number: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                      />
                    </div>
                  </div>
                  <div className="w-full flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-idcard">
                        {t("createLetter.id_card_number")}
                      </label>
                      <input
                        id="manual-idcard"
                        type="text"
                        value={manualReceiver.id_card_number}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            id_card_number: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label htmlFor="manual-idtype">
                        {t("createLetter.id_card_type")}
                      </label>
                      <select
                        id="manual-idtype"
                        value={manualReceiver.id_card_type}
                        onChange={(e) =>
                          setManualReceiver({
                            ...manualReceiver,
                            id_card_type: e.target.value,
                          })
                        }
                        className="bg-[#b4c8db] border-2 h-8 outline-none px-3 rounded-md border-gray-600"
                      >
                        {id_types.map((idType) => (
                          <option key={idType.id} value={idType.value}>
                            {idType.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-1"></div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleAddManualReceiver();
                        setShowManualEntry(false);
                      }}
                      className="bg-[#10172A] text-white px-4 py-1.5 rounded-md hover:bg-[#233058] text-sm"
                    >
                      {t("createLetter.save")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualEntry(false);
                        setManualReceiver({
                          id: "",
                          name: "",
                          post: "",
                          id_card_number: "",
                          id_card_type: "unknown",
                          office_name: "",
                          office_address: "",
                          phone_number: "",
                          vehicle_number: "",
                          isManual: true,
                        });
                      }}
                      className="bg-gray-500 text-white px-4 py-1.5 rounded-md hover:bg-gray-600 text-sm"
                    >
                      {t("createLetter.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Submit */}
      <div className="flex mt-4">
        <button
          type="button"
          onClick={handleSubmitWrapper}
          disabled={formState.isSubmitting}
          className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
        >
          {formState.isSubmitting ? t("editLetter.updating") : t("editLetter.update")}
        </button>
      </div>
    </div>
  );
};

export default EditLetter;
