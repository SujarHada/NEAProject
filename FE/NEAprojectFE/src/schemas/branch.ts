import * as z from "zod";

export const branchCreationSchema = (t: (key: string) => string) => {

    return (
        z.object({
            name: z.string().min(1, t("createBranch.validation.name")),
            email: z.email({ message: t("createBranch.validation.emailInvalid") }).min(1, t("createBranch.validation.email")),
            address: z.string().min(1, t("createBranch.validation.address")),
            phone_number: z.string()
                .min(1, t("createBranch.validation.phone"))
                .regex(/^[\d\u0966-\u096F]{10}$/, t("createBranch.validation.phoneNum"))
                .max(10, t("createBranch.validation.phoneMax"))
        })

    )
}

export const branchUpdateSchema = (t: (key: string) => string) => {

    return (

        z.object({
            name: z.string().min(1, t("editBranch.validation.name")),
            email: z.email({ message: t("editBranch.validation.emailInvalid") }).min(1, t("editBranch.validation.email")),
            address: z.string().min(1, t("editBranch.validation.address")),
            phone_number: z.string()
                .min(1, t("editBranch.validation.phone"))
                .regex(/^[\d\u0966-\u096F]+$/, t("editBranch.validation.phoneNum"))
                .max(10, t("editBranch.validation.phoneMax"))
        })

    )
}