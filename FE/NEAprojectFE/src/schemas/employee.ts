import * as z from 'zod'

export const createEmployeesFormSchema = (t: (key: string) => string) => {
    return z.object({
        first_name: z.string().min(1, t("createEmployee.errors.firstName")),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, t("createEmployee.errors.lastName")),
        email: z.email(t("createEmployee.errors.emailInvalid")).min(1, t("createEmployee.errors.emailRequired")),
        password: z.string().min(8, t("createEmployee.errors.passwordLength")),
        organization_id: z.number().positive(t("createEmployee.errors.branchId")),
        role: z.enum(['admin', 'viewer'], t("createEmployee.errors.position")),
    })
}

export interface CreateEmployeesFormData extends z.infer<ReturnType<typeof createEmployeesFormSchema>> {}

export const updateEmployeesFormSchema = createEmployeesFormSchema;

// export const updateEmployeesFormSchema = (t: (key: string) => string) => {
//     return z.object({
//         first_name: z.string().min(1, t("editEmployee.errors.firstName")),
//         middle_name: z.string().optional(),
//         last_name: z.string().min(1, t("editEmployee.errors.lastName")),
//         email: z.email(t("editEmployee.errors.emailInvalid")).min(1, t("editEmployee.errors.emailRequired")),
//         organization_id: z.number().positive(t("editEmployee.errors.branchId")),
//         role: z.enum(['admin', 'viewer'], t("createEmployee.errors.position")),
//     })
// }

export interface UpdateEmployeesFormData extends z.infer<ReturnType<typeof updateEmployeesFormSchema>> {}