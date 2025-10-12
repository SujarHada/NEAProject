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
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    organization_id: string
    position: string
}

export interface EditEmployeesInputs {
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    position: string
    organization_id: string
}

export interface Employee{
    id:number
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    position: string
    organization_id: string
    branch_name: string
    serial_number:number
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
    serial_number:number
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