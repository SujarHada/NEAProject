import * as z from 'zod'

export const createReceiverSchema = (t: (key: string) => string) => {
    return z.object({
        name: z.string().min(1, t("createReceiver.errors.nameRequired")),
        office_name: z.string().min(1, t("createReceiver.errors.deptRequired")),
        office_address: z.string().min(1, t("createReceiver.errors.deptAddressRequired")),
        id_card_number: z.string().min(1, t("createReceiver.errors.idNo")),
        id_card_type: z.enum(["national_id", "citizenship", "voter_id", "passport", "drivers_license", "pan_card", "unknown"], t("createReceiver.errors.idType")),
        phone_number: z.string()
            .min(1, t("createReceiver.errors.phone"))
            .regex(/^[\d\u0966-\u096F]+$/, t("createReceiver.errors.phoneNum"))
            .max(10, t("createReceiver.errors.phoneMax")),
        post: z.string().min(1, t("createReceiver.errors.post")),
        vehicle_number: z.string().min(1, t("createReceiver.errors.vehicleNo")),
    })
}

export const updateReceiverSchema = (t: (key: string) => string) => {
    return z.object({
        name: z.string().min(1, t("editReceiver.errors.nameRequired")),
        office_name: z.string().min(1, t("editReceiver.errors.deptRequired")),
        office_address: z.string().min(1, t("editReceiver.errors.deptAddressRequired")),
        id_card_number: z.string().min(1, t("editReceiver.errors.idNo")),
        id_card_type: z.enum(["national_id", "citizenship", "voter_id", "passport", "drivers_license", "pan_card", "unknown"], t("editReceiver.errors.idType")),
        phone_number: z.string()
            .min(1, t("editReceiver.errors.phone"))
            .regex(/^[\d\u0966-\u096F]+$/, t("editReceiver.errors.phoneNum"))
            .max(10, t("editReceiver.errors.phoneMax")),
        post: z.string().min(1, t("editReceiver.errors.post")),
        vehicle_number: z.string().min(1, t("editReceiver.errors.vehicleNo")),
    })
}