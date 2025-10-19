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
    role: string
    organization_id: string
    branch_name: string
    serial_number:number
}

export interface createEmployeesInputs extends Omit<Employee, 'id' | 'serial_number' | 'branch_name'>{}

export interface EditEmployeesInputs extends createEmployeesInputs{}

export interface Receiver {
  id: number
  name: string
  post: string
  id_card_number: string
  id_card_type: "national_id" | "citizenship" | "voter_id" | "passport" | "drivers_license" | "pan_card" | "unknown"
  office_name: string
  office_address: string
  phone_number: string
  vehicle_number: string
}
export interface createReceiverInputs extends Omit<Receiver, 'id'>{}


export interface Office {
    id:number
    serial_number:number
    name:string
    email:string
    address:string
    phone_number:string
}
export interface OfficeFormInputs extends Omit<Office, 'id' | 'serial_number'>{}