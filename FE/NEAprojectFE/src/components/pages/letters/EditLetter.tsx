import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useDataStore from "../../../store/useDataStore";
import { useEffect, useState } from "react";
import type { Letter, Receiver } from "../../../interfaces/interfaces";
import NepaliDatePicker from "@zener/nepali-datepicker-react";
import "@zener/nepali-datepicker-react/index.css";
import api from "../../../utils/api";
import { useNavigate, useParams } from "react-router";
import { updateLetterSchema, type EditLetter as EditLetterI } from "../../../schemas/letter";
import { useTranslation } from "react-i18next";
import { nepToEng } from "../../../utils/englishtonepaliNumber";

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
    reset
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
    },
  });

  const { Offices, Receivers, Products, ...StoreMethods } = useDataStore();
  const [filteredReceivers, setFilteredReceivers] = useState<Receiver[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    StoreMethods.getOffices();
    StoreMethods.getReceivers();
    StoreMethods.getProducts();
  }, []);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const res = await api.get(`/api/letters/${id}/`);
        if (res.status === 200) {
          const letter:Letter = res.data.data;

          const officeReceivers = Receivers?.filter(
            (r) => r.id_card_number === letter.receiver.id_card_number
          );
          setFilteredReceivers(officeReceivers || []);

          reset({
            ...letter,
            receiver: {
              ...letter.receiver,
              id_card_type: letter.receiver.id_card_type || "unknown",
            },
            items: letter.items || [],
            date: letter.date,
            request_date: letter.request_date,
          });
        }
      } catch (err) {
        console.error("Error fetching letter:", err);
      }
    };

    if (Receivers && Offices && Products) {
      console.log("Fetching letter...");
      fetchLetter();
    }
  }, [Receivers, Offices, Products]);

  const handleOfficeChange = (officeId: string) => {
    const selectedOffice = Offices?.find(
      (o) => o.id.toString() === officeId
    );
    if (selectedOffice) {
      setValue("office_name", selectedOffice.name);
      setValue("receiver_address", selectedOffice.address);

      const filtered = Receivers?.filter(
        (r) => r.office_name === selectedOffice.name
      );
      setFilteredReceivers(filtered || []);
    } else {
      setValue("office_name", "");
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

  // console.log(watch())

  const onSubmit = async (data: EditLetterI) => {
    try {
      const res = await api.put(`/api/letters/${id}/`, data);
      if (res.status === 200) {
        navigate(`/letters/view-letter/${res.data.data.id}`);
      }
    } catch (err) {
      console.error("Error updating letter:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("editLetter.title")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* --- Date and IDs --- */}
        <div className="flex flex-1 flex-row gap-2 flex-wrap">
          <div className="flex max-sm:w-full flex-col">
            <label htmlFor="date">{t("editLetter.date")} *</label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-0 rounded-md border-gray-600">
                  <NepaliDatePicker
                    {...field}
                    value={nepToEng(field.value)}
                    onChange={(e) =>
                      field.onChange(e!.format("YYYY-MM-DD", "np"))
                    }
                    className="h-10 px-3 cursor-pointer"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              )}
            />
            {errors.date && (
              <span className="text-red-500">{errors.date.message}</span>
            )}
          </div>

          <div className="flex flex-1 w-full flex-col">
            <label htmlFor="letter_count">
              {t("editLetter.letter_count")} *
            </label>
            <Controller
              name="letter_count"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="letter_count"
                  type="text"
                  className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                />
              )}
            />
            {errors.letter_count && (
              <span className="text-red-500">
                {errors.letter_count.message}
              </span>
            )}
          </div>

          <div className="flex flex-1 w-full flex-col">
            <label htmlFor="chalani">{t("editLetter.chalani_no")} *</label>
            <Controller
              name="chalani_no"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="chalani"
                  type="text"
                  className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                />
              )}
            />
            {errors.chalani_no && (
              <span className="text-red-500">{errors.chalani_no.message}</span>
            )}
          </div>

          <div className="flex flex-1 w-full flex-col ">
            <label htmlFor="voucher_no">{t("editLetter.voucher_no")} *</label>
            <Controller
              name="voucher_no"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="voucher_no"
                  type="text"
                  className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                />
              )}
            />
            {errors.voucher_no && (
              <span className="text-red-500">{errors.voucher_no.message}</span>
            )}
          </div>

          <div className="flex max-md:flex-1 max-md:w-full flex-col ">
            <label htmlFor="gatepass_no">{t("editLetter.gatepass_no")}</label>
            <Controller
              name="gatepass_no"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="gatepass_no"
                  type="text"
                  className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
                />
              )}
            />
            {errors.gatepass_no && (
              <span className="text-red-500">{errors.gatepass_no.message}</span>
            )}
          </div>
        </div>

        {/* --- Subject + Office --- */}
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col flex-1">
            <label>{t("editLetter.select_office")} *</label>
            <select
              onChange={(e) => handleOfficeChange(e.target.value)}
              value={
                Offices?.find(
                  (o) => o.name === control._formValues.office_name
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
            <label>{t("editLetter.subject")} *</label>
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
              <label>{t("editLetter.request_date")} *</label>
              <Controller
                name="request_date"
                control={control}
                render={({ field }) => (
                  <div className="bg-[#B5C9DC] border-2 h-10 outline-none z-50 rounded-md border-gray-600">
                    <NepaliDatePicker
                      {...field}
                      value={nepToEng(field.value)}
                      onChange={(e) =>
                        field.onChange(e!.format("YYYY-MM-DD", "np"))
                      }
                      className="h-10 px-3 cursor-pointer"
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
              <label>{t("editLetter.request_chalani_number")} *</label>
              <Controller
                name="request_chalani_number"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="request_chalani_number"
                    type="text"
                    className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
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
              <label>{t("editLetter.request_letter_count")} *</label>
              <Controller
                name="request_letter_count"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="request_letter_count"
                    type="text"
                    className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
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

        {/* --- Items Section --- */}
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
          <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => append({product_id:'', name: "", company: "", serial_number: '', unit_of_measurement: "", quantity: '', remarks: "" })}>
            Add Item
          </button>
        </div>

        {/* --- Receiver Section --- */}
        <div className="flex w-full flex-col gap-4 ">
          <div className="w-full flex gap-4  flex-wrap ">
            <div className="flex flex-col flex-1">
              <label htmlFor="receiverSelect">{t("createLetter.select_receiver")} *</label>
              <Controller
                name="receiver.id_card_number"
                control={control}
                render={({ field }) =>
                (
                  <select id="receiverSelect" {...field} onChange={e => handleReceiverChange(e.target.value)} disabled={!filteredReceivers.length} className="bg-[#B5C9DC] border-2 h-10 outline-none px-3 rounded-md border-gray-600">
                    <option value="" hidden>{filteredReceivers.length ? t("createLetter.select_receiver") : t("createLetter.no_receiver_found")}</option>
                    {filteredReceivers.map(r => <option key={r.id} value={r.id_card_number}>{r.name}</option>)}
                  </select>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
        >
          {isSubmitting ? t("editLetter.updating") : t("editLetter.update")}
        </button>
      </form>
    </div>
  );
};

export default EditLetter;
