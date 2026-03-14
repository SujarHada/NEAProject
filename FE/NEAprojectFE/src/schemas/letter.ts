import { nepToEng } from "app/utils/englishtonepaliNumber";
import z from "zod";

export const createLetterSchema = z
	.object({
		id: z.number().optional(),
		letter_count: z
			.string()
			.regex(/^[\d\u0966-\u096F/]+$/, "पत्र संख्या संख्यात्मक हुनुपर्छ"),
		chalani_no: z
			.string()
			.regex(/^[\d\u0966-\u096F/]+$/, "चलानी नं संख्यात्मक हुनुपर्छ")
			.min(1, "चलानी नं आवश्यक छ"),
		voucher_no: z
			.string()
			.regex(/^[\d\u0966-\u096F/]+$/, "भौचर नं संख्यात्मक हुनुपर्छ")
			.min(1, "भौचर नं आवश्यक छ"),
		office_id: z.string().min(1, "प्राप्तकर्ता कार्यालय आवश्यक छ"),
		date: z.string().min(1, "मिति आवश्यक छ"),
		office_name: z.string().min(1, "प्राप्तकर्ता कार्यालयको नाम आवश्यक छ"),
		receiver_id: z.string().optional(),
		receiver_address: z.string().min(1, "प्राप्तकर्ता ठेगाना आवश्यक छ"),
		subject: z.string().min(1, "विषय आवश्यक छ"),
		request_chalani_number: z
			.string()
			.min(1, "अनुरोध चलानी नं आवश्यक छ"),
		request_letter_count: z
			.string()
			.regex(/^[\d\u0966-\u096F/]+$/, "अनुरोध पत्र संख्या संख्यात्मक हुनुपर्छ"),
		request_date: z.string().min(1, "अनुरोध मिति आवश्यक छ"),
		gatepass_no: z.string().optional(),

		items: z
			.array(
				z
					.object({
						product_id: z
							.string({ error: "उत्पाद आवश्यक छ" })
							.min(1, "उत्पाद आवश्यक छ"),
						name: z.string().min(1, "सामानको नाम आवश्यक छ"),
						company: z.string().min(1, "कम्पनीको नाम आवश्यक छ"),
						serial_number: z.string().min(1, "सरियल नं आवश्यक छ"),
						unit_of_measurement: z
							.string()
							.min(1, "नापको एकाइ आवश्यक छ"),
						quantity: z
							.string()
							.min(1, "मात्रा आवश्यक छ")
							.regex(/^[\d\u0966-\u096F]+$/, "मात्रा संख्यात्मक हुनुपर्छ"),
						remarks: z.string().optional(),
					})
					.refine(
						(item) => {
							const sn = item.serial_number.trim();
							if (sn === "" || sn === "-") return true;
							const count = sn
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean).length;

							return count === Number(item.quantity);
						},
						{
							message: "सरियल नं को संख्या मात्रासँग मेल खानुपर्छ",
							path: ["quantity"],
						},
					),
			)
			.min(1, "कम्तिमा एक सामान आवश्यक छ"),

		receiver: z.object({
			name: z.string().min(1, "प्राप्तकर्ताको नाम आवश्यक छ"),
			post: z.string().min(1, "प्राप्तकर्ताको पद आवश्यक छ"),
			id_card_number: z.string().min(1, "परिचयपत्र नं आवश्यक छ"),
			id_card_type: z.enum([
				"national_id",
				"citizenship",
				"voter_id",
				"passport",
				"drivers_license",
				"pan_card",
				"unknown",
				"employee_id",
			]),
			office_name: z.string().min(1, "कार्यालयको नाम आवश्यक छ"),
			office_address: z.string().min(1, "कार्यालयको ठेगाना आवश्यक छ"),
			phone_number: z
				.string()
				.regex(/^[\d\u0966-\u096F,\s]+$/, "फोन नं संख्यात्मक हुनुपर्छ (धेरै भएकोमा अल्पविराम लगाउनुहोस्)")
				.min(1, "फोन नं आवश्यक छ"),
			vehicle_number: z.string().min(1, "सवारी नं आवश्यक छ"),
		}),
	})
	.refine(
		(data) => {
			return data.items.every(
				(item) =>
					item.name &&
					item.company &&
					item.serial_number &&
					item.unit_of_measurement,
			);
		},
		{
			error: "सबै सामानहरू भर्नु पर्छ",
			path: ["items"],
		},
	);

export type CreateLetter = z.infer<typeof createLetterSchema>;

export const updateLetterSchema = z.object({
	id: z.number().optional(),
	letter_count: z
		.string()
		.regex(/^[\d\u0966-\u096F/]+$/, "पत्र संख्या संख्यात्मक हुनुपर्छ"),
	chalani_no: z.string().min(1, "चलानी नं आवश्यक छ"),
	voucher_no: z.string().min(1, "भौचर नं आवश्यक छ"),
	office_id: z.string().min(1, "प्राप्तकर्ता कार्यालय आवश्यक छ"),
	date: z.string().min(1, "मिति आवश्यक छ"),
	office_name: z.string().min(1, "प्राप्तकर्ता कार्यालयको नाम आवश्यक छ"),
	receiver_id: z.string().optional(),
	receiver_address: z.string().min(1, "प्राप्तकर्ता ठेगाना आवश्यक छ"),
	subject: z.string().min(1, "विषय आवश्यक छ"),
	request_chalani_number: z
		.string()
		.min(1, "अनुरोध चलानी नं आवश्यक छ"),
	request_letter_count: z
		.string()
		.regex(/^[\d\u0966-\u096F/]+$/, "अनुरोध पत्र संख्या संख्यात्मक हुनुपर्छ"),
	request_date: z.string().min(1, "अनुरोध मिति आवश्यक छ"),
	gatepass_no: z.string().optional(),

	items: z
		.array(
			z.object({
				product_id: z.string(),
				name: z.string().min(1, "सामानको नाम आवश्यक छ"),
				company: z.string().min(1, "कम्पनीको नाम आवश्यक छ"),
				serial_number: z.string().min(1, "सरियल नं आवश्यक छ"),
				unit_of_measurement: z
					.string()
					.min(1, "नापको एकाइ आवश्यक छ"),
				quantity: z
					.string()
					.regex(/^[\d\u0966-\u096F]+$/, "मात्रा संख्यात्मक हुनुपर्छ"),
				remarks: z.string().optional(),
			}).refine(
				(item) => {
					const sn = item.serial_number.trim();
					if (sn === "" || sn === "-") return true;
					const count = sn
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean).length;

					return count === Number(nepToEng(item.quantity));
				},
				{
					message: "सरियल नं को संख्या मात्रासँग मेल खानुपर्छ",
					path: ["quantity"],
				},
			),
		)
		.min(1, "कम्तिमा एक सामान आवश्यक छ"),

	receiver: z.object({
		name: z.string().min(1, "प्राप्तकर्ताको नाम आवश्यक छ"),
		post: z.string().min(1, "प्राप्तकर्ताको पद आवश्यक छ"),
		id_card_number: z.string().min(1, "परिचयपत्र नं आवश्यक छ"),
		id_card_type: z.enum([
			"national_id",
			"citizenship",
			"voter_id",
			"passport",
			"drivers_license",
			"pan_card",
			"unknown",
			"employee_id",
		]),
		office_name: z.string().min(1, "कार्यालयको नाम आवश्यक छ"),
		office_address: z.string().min(1, "कार्यालयको ठेगाना आवश्यक छ"),
		phone_number: z
			.string()
			.regex(/^[\d\u0966-\u096F,\s]+$/, "फोन नं संख्यात्मक हुनुपर्छ (धेरै भएकोमा अल्पविराम लगाउनुहोस्)")
			.min(1, "फोन नं आवश्यक छ"),
		vehicle_number: z.string().min(1, "सवारी नं आवश्यक छ"),
	}),
});

export type EditLetter = z.infer<typeof updateLetterSchema>;
