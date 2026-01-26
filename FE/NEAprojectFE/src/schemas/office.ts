import * as z from "zod";
export const createOfficeFormschema = (t: (key: string) => string) => {
	return z.object({
		name: z.string().min(1, t("createOffice.errors.nameRequired")),
		email: z
			.string()
			.min(1, t("createOffice.errors.emailRequired"))
			.email(t("createOffice.errors.emailInvalid")),
		address: z.string().min(1, t("createOffice.errors.addressRequired")),
		phone_number: z
			.string()
			.min(1, t("createOffice.errors.phoneRequired"))
			.regex(/^[\d\u0966-\u096F]+$/, t("createOffice.errors.phoneNumber"))
			.max(10, t("createOffice.errors.phoneMax")),
	});
};

export type OfficeFormInputs = z.infer<
	ReturnType<typeof createOfficeFormschema>
>;

export const updateOfficeFormschema = (t: (key: string) => string) => {
	return z.object({
		name: z.string().min(1, t("editOffice.validation.name")),
		email: z
			.email({ message: t("editOffice.validation.emailInvalid") })
			.min(1, t("editOffice.validation.email")),
		address: z.string().min(1, t("editOffice.validation.address")),
		phone_number: z
			.string()
			.min(1, t("editOffice.validation.phone"))
			.regex(/^[\d\u0966-\u096F]+$/, t("editOffice.validation.phoneNumber"))
			.max(10, t("editOffice.validation.phoneMax")),
	});
};
