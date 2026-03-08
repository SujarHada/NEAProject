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
    formState: { isSubmitting, errors },
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

  const { Offices, Products, ...StoreMethods } =
    useDataStore();

  const [selectedReceivers, setSelectedReceivers] = useState<ReceiverEntry[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (!Offices.length) StoreMethods.getOffices();
    if (!Products.length) StoreMethods.getProducts();
  }, [
    Offices.length,
    StoreMethods.getProducts,
    StoreMethods.getOffices,
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
          if (receiver && receiver.name) {
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
  }, [id, reset, Offices]);

  const handleOfficeChange = (officeId: string) => {
    const selectedOffice = Offices?.find((o) => o.id.toString() === officeId);
    if (selectedOffice) {
      setValue("office_id", selectedOffice.id.toString());
      setValue("office_name", selectedOffice.name);
      setValue("receiver_address", selectedOffice.address);
    }
    trigger("office_id");
  };

  const handleSubmitWrapper = () => {
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
          {errors.date && (
            <span className="text-red-500">{errors.date.message}</span>
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
          {errors.letter_count && (
            <span className="text-red-500">{errors.letter_count.message}</span>
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
          {errors.chalani_no && (
            <span className="text-red-500">{errors.chalani_no.message}</span>
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
          {errors.voucher_no && (
            <span className="text-red-500">{errors.voucher_no.message}</span>
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
          {errors.gatepass_no && (
            <span className="text-red-500">{errors.gatepass_no.message}</span>
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
            {errors.office_name && (
              <span className="text-red-500">{errors.office_name.message}</span>
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
            {errors.subject && (
              <span className="text-red-500">{errors.subject.message}</span>
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
            {errors.request_date && (
              <span className="text-red-500">
                {errors.request_date.message}
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
            {errors.request_chalani_number && (
              <span className="text-red-500">
                {errors.request_chalani_number.message}
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
            {errors.request_letter_count && (
              <span className="text-red-500">
                {errors.request_letter_count.message}
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
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const selected = Products?.find(
                          (p) => p.id.toString() === e.target.value,
                        );
                        if (selected) {
                          setValue(`items.${index}.name`, selected.name);
                          setValue(
                            `items.${index}.product_id`,
                            selected.id.toString(),
                          );
                          setValue(`items.${index}.company`, selected.company);
                          setValue(
                            `items.${index}.unit_of_measurement`,
                            selected.unit_of_measurement,
                          );
                        }
                      }}
                      className="bg-[#B5C9DC] w-full min-w-[203px] border-2 h-8 outline-none px-3 rounded-md border-gray-600"
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
                  )}
                />
                {errors.items?.[index]?.name && (
                  <span className="text-[#B22222]">
                    {errors.items[index].name.message}
                  </span>
                )}
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
                          );
                        }}
                        className="bg-[#B5C9DC] w-full border-2 h-8 outline-none px-3 rounded-md border-gray-600"
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
                  {errors.items?.[index]?.name && (
                    <span className="text-[#B22222]">
                      {errors.items[index].name.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-wrap justify-between  flex-row gap-2">
                  <div className={"  flex-col flex-2 max-w-[66%] flex"}>
                    <Controller
                      name={`items.${index}.serial_number`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            const trimmed = value.trim();
                            if (trimmed === "" || trimmed === "-") {
                              return;
                            }
                            const count = trimmed
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean).length;
                            setValue(`items.${index}.quantity`, String(count));
                          }}
                          type="text"
                          className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                        />
                      )}
                    />
                    {errors.items?.[index]?.serial_number && (
                      <span className="text-[#B22222]">
                        {errors.items[index].serial_number.message}
                      </span>
                    )}
                  </div>
                  <div className="flex max-w-[30%] flex-1 flex-col gap-2">
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="bg-[#B5C9DC] border-1 h-8 outline-none pl-3 rounded-md border-gray-600"
                        />
                      )}
                    />
                    {errors.items?.[index]?.quantity && (
                      <span className="text-[#B22222]">
                        {errors.items[index].quantity.message}
                      </span>
                    )}
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
                {errors.items?.[index]?.remarks && (
                  <span className="text-[#B22222]">
                    {errors.items[index].remarks.message}
                  </span>
                )}
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

      {/* Receiver - Edit Mode with comma-separated fields */}
      <div className="flex w-full flex-col gap-2">
        <div className="bg-[#91a4c3] px-4 py-2 rounded-t-md font-semibold text-black">
          {t("createLetter.receiver_details") || "प्राप्तकर्ता विवरण"}
        </div>
        <div className="bg-[#90a3c2] px-4 py-3 rounded-b-md flex flex-col gap-3">
          <div className="w-full flex gap-4 flex-wrap">
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-name">{t("createLetter.manual_receiver_name")} *</label>
              <input
                id="receiver-name"
                type="text"
                value={selectedReceivers.map((r) => r.name).join(", ")}
                onChange={(e) => {
                  const names = e.target.value.split(",").map((n) => n.trim()).filter(Boolean);
                  const newReceivers = names.map((name, index) => {
                    const existing = selectedReceivers[index];
                    return existing ? { ...existing, name } : {
                      id: `new-${index}`,
                      name,
                      post: "",
                      id_card_number: "",
                      id_card_type: "unknown",
                      office_name: "",
                      office_address: "",
                      phone_number: "",
                      vehicle_number: "",
                      isManual: true,
                    };
                  });
                  setSelectedReceivers(newReceivers);
                }}
                placeholder={t("createLetter.name_placeholder") || "Name 1, Name 2, Name 3"}
                className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-post">{t("createLetter.post")}</label>
              <input
                id="receiver-post"
                type="text"
                value={selectedReceivers.map((r) => r.post).join(", ")}
                onChange={(e) => {
                  const posts = e.target.value.split(",").map((p) => p.trim());
                  setSelectedReceivers(
                    selectedReceivers.map((r, i) => ({ ...r, post: posts[i] || "" }))
                  );
                }}
                placeholder={t("createLetter.post_placeholder") || "Post 1, Post 2, Post 3"}
                className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            </div>
          </div>
          <div className="w-full flex gap-4 flex-wrap">
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-office">{t("createLetter.office_name")}</label>
              <input
                id="receiver-office"
                type="text"
                value={selectedReceivers.map((r) => r.office_name).join(", ")}
                onChange={(e) => {
                  const offices = e.target.value.split(",").map((o) => o.trim());
                  setSelectedReceivers(
                    selectedReceivers.map((r, i) => ({ ...r, office_name: offices[i] || "" }))
                  );
                }}
                placeholder={t("createLetter.office_placeholder") || "Office 1, Office 2, Office 3"}
                className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-address">{t("createLetter.receiver_office_address")}</label>
              <input
                id="receiver-address"
                type="text"
                value={selectedReceivers.map((r) => r.office_address).join(", ")}
                onChange={(e) => {
                  const addresses = e.target.value.split(",").map((a) => a.trim());
                  setSelectedReceivers(
                    selectedReceivers.map((r, i) => ({ ...r, office_address: addresses[i] || "" }))
                  );
                }}
                placeholder={t("createLetter.address_placeholder") || "Address 1, Address 2, Address 3"}
                className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            </div>
          </div>
          <div className="w-full flex gap-4 flex-wrap">
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-vehicle">{t("createLetter.vehiche_number")}</label>
              <input
                id="receiver-vehicle"
                type="text"
                value={selectedReceivers.map((r) => r.vehicle_number).join(", ")}
                onChange={(e) => {
                  const vehicles = e.target.value.split(",").map((v) => v.trim());
                  setSelectedReceivers(
                    selectedReceivers.map((r, i) => ({ ...r, vehicle_number: vehicles[i] || "" }))
                  );
                }}
                placeholder={t("createLetter.vehicle_placeholder") || "Vehicle 1, Vehicle 2, Vehicle 3"}
                className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-phone">{t("createLetter.phone_number")}</label>
              <input
                id="receiver-phone"
                type="text"
                value={selectedReceivers.map((r) => r.phone_number).join(", ")}
                onChange={(e) => {
                  const phones = e.target.value.split(",").map((p) => p.trim());
                  setSelectedReceivers(
                    selectedReceivers.map((r, i) => ({ ...r, phone_number: phones[i] || "" }))
                  );
                }}
                placeholder={t("createLetter.phone_placeholder") || "Phone 1, Phone 2, Phone 3"}
                className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            </div>
          </div>
          <div className="w-full flex gap-4 flex-wrap">
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-idcard">{t("createLetter.id_card_number")}</label>
              <input
                id="receiver-idcard"
                type="text"
                value={selectedReceivers.map((r) => r.id_card_number).join(", ")}
                onChange={(e) => {
                  const idCards = e.target.value.split(",").map((i) => i.trim());
                  setSelectedReceivers(
                    selectedReceivers.map((r, i) => ({ ...r, id_card_number: idCards[i] || "" }))
                  );
                }}
                placeholder={t("createLetter.idcard_placeholder") || "ID 1, ID 2, ID 3"}
                className="bg-[#b4c8db] border-2 h-8 outline-none pl-3 rounded-md border-gray-600"
              />
            </div>
            <div className="flex flex-col flex-1">
              <label htmlFor="receiver-idtype">{t("createLetter.id_card_type")}</label>
              <select
                id="receiver-idtype"
                value={selectedReceivers[0]?.id_card_type || "unknown"}
                onChange={(e) => {
                  setSelectedReceivers(
                    selectedReceivers.map((r) => ({ ...r, id_card_type: e.target.value }))
                  );
                }}
                className="bg-[#b4c8db] border-2 h-8 outline-none px-3 rounded-md border-gray-600"
              >
                {id_types.map((idType) => (
                  <option key={idType.id} value={idType.value}>
                    {idType.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedReceivers([
                  ...selectedReceivers,
                  {
                    id: `new-${Date.now()}`,
                    name: "",
                    post: "",
                    id_card_number: "",
                    id_card_type: "unknown",
                    office_name: "",
                    office_address: "",
                    phone_number: "",
                    vehicle_number: "",
                    isManual: true,
                  },
                ]);
              }}
              className="bg-[#10172A] text-white px-4 py-2 rounded-md hover:bg-[#233058]"
            >
              + {t("createLetter.add_receiver") || "थप प्राप्तकर्ता"}
            </button>
            {selectedReceivers.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedReceivers(selectedReceivers.slice(0, -1))}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                - {t("createLetter.remove_last") || "हटाउनुहोस्"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex mt-4">
        <button
          type="button"
          onClick={handleSubmitWrapper}
          disabled={isSubmitting}
          className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
        >
          {isSubmitting ? t("editLetter.updating") : t("editLetter.update")}
        </button>
      </div>
    </div>
  );
};

export default EditLetter;
