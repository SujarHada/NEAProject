import * as z from 'zod'

export const createProductFormschema = (t: (key: string) => string) => {
    return z.object({
        name: z.string().min(1, t("editProductPage.errors.productNameRequired")),
        company: z.string().min(1, t("editProductPage.errors.companyNameRequired")),
        unit_of_measurement: z.string().min(1, t("editProductPage.errors.unitRequired")),
        remarks: z.string().optional(),
    })
}

export const updateProductFormschema = (t: (key: string) => string) => {
    return z.object({
        name: z.string().min(1, t("editProductPage.errors.productNameRequired")),
        company: z.string().min(1, t("editProductPage.errors.companyNameRequired")),
        unit_of_measurement: z.string().min(1, t("editProductPage.errors.unitRequired")),
        remarks: z.string().optional(),
    })
}