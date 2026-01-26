import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { createReceiverInputs } from "app/interfaces/interfaces";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";
import { id_types } from "app/enum/id_types";
import api from "app/utils/api";
import useDataStore from "app/store/useDataStore";
import { useEffect } from "react";
import { createReceiverSchema } from "app/schemas/receiver";
const CreateReceiver = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const CreateReceiversFormschema = createReceiverSchema(t);
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, errors },
		setValue,
	} = useForm<createReceiverInputs>({
		defaultValues: {
			name: "",
			post: "",
			id_card_number: "",
			id_card_type: "national_id",
			office_name: "",
			office_address: "",
			phone_number: "",
			vehicle_number: "",
		},
		resolver: zodResolver(CreateReceiversFormschema),
		mode: "onSubmit",
	});
	const { Offices, getOffices } = useDataStore();
	useEffect(() => {
		getOffices();
	}, []);

	const handleOfficeSelect = (officeId: string) => {
		const office = Offices.find((b) => b.id === parseInt(officeId));
		if (office) {
			setValue("office_name", office.name);
			setValue("office_address", office.address);
		}
	};

	const onSubmit: SubmitHandler<createReceiverInputs> = async (data) => {
		const res = await api.post("/api/receivers/", data);
		if (res.status === 201) {
			navigate("/receiver/receiver-list");
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-bold">{t("createReceiver.title")}</h1>
			<div className="flex gap-4 w-full flex-wrap">
				<div className="flex flex-col flex-1 lg:w-1/2 gap-2">
					<label htmlFor="name">{t("createReceiver.labels.name")} </label>
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<input
								type="text"
								{...field}
								className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
								id="name"
							/>
						)}
					/>
					{errors.name && <p className="text-red-500">{errors.name.message}</p>}
				</div>
				<div className="flex flex-1 flex-col w-full gap-2">
					<label htmlFor="post"> {t("createReceiver.labels.post")} </label>
					<Controller
						name="post"
						control={control}
						render={({ field }) => (
							<input
								type="text"
								{...field}
								className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
								id="post"
							/>
						)}
					/>
					{errors.post && <p className="text-red-500">{errors.post.message}</p>}
				</div>
			</div>
			<div className="flex gap-4 w-full flex-wrap">
				<div className="w-full flex-1 flex flex-col gap-2">
					<label htmlFor="id_card_number">
						{" "}
						{t("createReceiver.labels.idNo")}{" "}
					</label>
					<Controller
						name="id_card_number"
						control={control}
						render={({ field }) => (
							<input
								type="text"
								{...field}
								className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
								id="id_card_number"
							/>
						)}
					/>
					{errors.id_card_number && (
						<p className="text-red-500">{errors.id_card_number.message}</p>
					)}
				</div>
				<div className="w-full flex flex-1 flex-col gap-2">
					<label htmlFor="id_card_type">
						{" "}
						{t("createReceiver.labels.idType")}{" "}
					</label>
					<Controller
						name="id_card_type"
						control={control}
						render={({ field }) => (
							<div className="flex w-full items-center relative">
								<select
									id="position"
									{...field}
									className="bg-[#B5C9DC] appearance-none w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600"
								>
									{id_types.map((idType) => (
										<option key={idType.id} value={idType.value}>
											{idType.name}
										</option>
									))}
								</select>
								<FaChevronDown className="absolute right-3 text-gray-500" />
							</div>
						)}
					/>
					{errors.id_card_type && (
						<p className="text-red-500">{errors.id_card_type.message}</p>
					)}
				</div>
			</div>
			{/* <div className="flex gap-4 w-1/2 flex-wrap"> */}
			<div className="sm:w-1/2 flex flex-1 flex-col gap-2 ">
				<label htmlFor="office_name"> Office *</label>
				<select
					onChange={(e) => handleOfficeSelect(e.target.value)}
					className="bg-[#B5C9DC]  w-full border-2 h-10 outline-none px-3 rounded-md border-gray-600"
				>
					<option value="" hidden>
						{" "}
						Select Office{" "}
					</option>
					{Offices.map((office) => (
						<option key={office.id} value={office.id}>
							{office.name}
						</option>
					))}
				</select>
			</div>
			{/* 
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="office_name"> {t("createReceiver.labels.deptName")} </label>
                    <Controller
                        name="office_name"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="office_name" />
                        )}
                    />
                    {errors.office_name && <p className="text-red-500">{errors.office_name.message}</p>}
                </div>
                <div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
                    <label htmlFor="office_address"> {t("createReceiver.labels.deptAddress")} </label>
                    <Controller
                        name="office_address"
                        control={control}
                        render={({ field }) => (
                            <input type="text" {...field} className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600" id="office_address" />
                        )}
                    />
                    {errors.office_address && <p className="text-red-500">{errors.office_address.message}</p>}
                </div> */}
			{/* </div> */}
			<div className="flex gap-4 w-full flex-wrap">
				<div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
					<label htmlFor="phone_number">
						{" "}
						{t("createReceiver.labels.phone")}{" "}
					</label>
					<Controller
						name="phone_number"
						control={control}
						render={({ field }) => (
							<input
								type="text"
								{...field}
								className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
								id="phone_number"
							/>
						)}
					/>
					{errors.phone_number && (
						<p className="text-red-500">{errors.phone_number.message}</p>
					)}
				</div>
				<div className="lg:w-1/2 flex flex-1 flex-col gap-2 ">
					<label htmlFor="vehicle_number">
						{" "}
						{t("createReceiver.labels.vehicleNo")}{" "}
					</label>
					<Controller
						name="vehicle_number"
						control={control}
						render={({ field }) => (
							<input
								type="text"
								{...field}
								className="bg-[#B5C9DC] border-2 h-10 outline-none pl-3 rounded-md border-gray-600"
								id="vehicle_number"
							/>
						)}
					/>
					{errors.vehicle_number && (
						<p className="text-red-500">{errors.vehicle_number.message}</p>
					)}
				</div>
			</div>
			<div className="flex">
				<button
					type="submit"
					disabled={isSubmitting}
					onClick={handleSubmit(onSubmit)}
					className="outline-none w-full bg-[#10172A] text-white h-12 hover:bg-[#233058] active:bg-[#314379] rounded-md disabled:opacity-50"
				>
					{isSubmitting
						? t("createReceiver.labels.creating")
						: t("createReceiver.labels.createReceiver")}
				</button>
			</div>
		</div>
	);
};

export default CreateReceiver;
