import * as z from 'zod'

export const createEmployeesFormSchema = (t: (key: string) => string) => {
    return z.object({
        first_name: z.string().min(1, t("createEmployee.errors.firstName")),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, t("createEmployee.errors.lastName")),
        email: z.email(t("createEmployee.errors.emailInvalid")).min(1, t("createEmployee.errors.emailRequired")),
        organization_id: z.number().positive(t("createEmployee.errors.branchId")),
        role: z.string().length(1, t("createEmployee.errors.position")),
    })
}

export const updateEmployeesFormSchema = (t: (key: string) => string) => {
    return z.object({
        first_name: z.string().min(1, t("editEmployee.errors.firstName")),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, t("editEmployee.errors.lastName")),
        email: z.email(t("editEmployee.errors.emailInvalid")).min(1, t("editEmployee.errors.emailRequired")),
        organization_id: z.number().positive(t("editEmployee.errors.branchId")),
        role: z.string().min(1, t("editEmployee.errors.position")),
    })
}