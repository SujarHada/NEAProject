export interface Branch{
    id:number
    serial_number:number
    organization_id:string
    name:string
    email:string
    address:string
    phone_number:string
}

export interface BranchFormInputs extends Omit<Branch, 'id' | 'serial_number' | 'organization_id'> {}

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
export interface createProductInputs extends Pick<Product, "name" | "company" | "unit_of_measurement" | "stock_quantity"> {} 

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

export interface createEmployeesInputs extends Omit<Employee, 'id' | 'serial_number' | 'branch_name'>{}

export interface EditEmployeesInputs extends createEmployeesInputs{}

export interface Receiver {
    name: string
    post: string
    id: string
    phoneNo: string
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


export interface Office {
    id:number
    serial_number:number
    name:string
    email:string
    address:string
    phone_number:string
}
export interface OfficeFormInputs extends Omit<Office, 'id' | 'serial_number'>{}