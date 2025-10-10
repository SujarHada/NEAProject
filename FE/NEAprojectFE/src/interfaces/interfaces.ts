export interface BranchFormInputs {
    name: string
    email: string
    address: string
    bank_name: string
    account_name: string
    account_number: string
    phone_number: string
}

export interface createProductInputs {
    name: string
    company: string
    unit_of_measurement: string
    stock_quantity: string
}

export interface Product {
    name: string
    id: number
    serial_number: number
    sku: string
    company: string
    status: string
    stock_quantity: string
    unit_of_measurement: string
}

export interface createEmployeesInputs {
    firstName: string
    middleName?: string
    lastName: string
    email: string
    branchId: string
    role: string
}

export interface EditEmployeesInputs {
    firstName: string
    middleName?: string
    lastName: string
    email: string
    role: string
}

export interface Employee{
    name: string
    email: string
    role: string
    branch: string
}

export interface createReceiverInputs {
    name:string
    post:string
    id:string
    idType:string
    departmentName:string
    departmentAddress:string
    phoneNo:string
    vehicleNo:string
}

export interface Receiver {
    name: string
    post: string
    id: string
    phoneNo: string
}

export interface Branch{
    id:number
    organization_id:string
    name:string
    email:string
    address:string
    bank_name:string
    account_name:string
    account_number:string
    phone_number:string
}

export interface Office {
    id:number
    name:string
    email:string
    address:string
    phone_number:string
}
export interface OfficeFormInputs extends Omit<Office, 'id'> {}