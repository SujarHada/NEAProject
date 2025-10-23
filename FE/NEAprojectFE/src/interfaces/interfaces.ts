export interface Branch {
  id: number
  serial_number: number
  organization_id: number
  name: string
  email: string
  address: string
  phone_number: string
}

export interface BranchFormInputs extends Omit<Branch, 'id' | 'serial_number' | 'organization_id'> { }

export interface Product {
  name: string
  id: number
  serial_number: number
  sku: string
  company: string
  status: string
  remarks?: string
  unit_of_measurement: string
}
export interface createProductInputs extends Pick<Product, "name" | "company" | "unit_of_measurement" | "remarks"> { }

export interface Employee {
  id: number
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  role: string
  organization_id: number
  branch_name: string
  serial_number: number
}

export interface createEmployeesInputs extends Omit<Employee, 'id' | 'serial_number' | 'branch_name'> { }

export interface EditEmployeesInputs extends createEmployeesInputs { }

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
export interface createReceiverInputs extends Omit<Receiver, 'id'> { }


export interface Office {
  id: number
  serial_number: number
  name: string
  email: string
  address: string
  phone_number: string
}
export interface OfficeFormInputs extends Omit<Office, 'id' | 'serial_number'> { }

export interface dashboard {
  total_active_products: number,
  total_active_branches: number,
  total_active_offices: number,
  total_active_employees: number,
  total_receivers: number,
  total_letters: number,
  total_draft_letters: number,
  total_sent_letters: number,
  last_updated: string
}

export interface user {
  id: string,
  name:string,
  email: string,
  role: string
}
export interface userloginResponse {
  access: string
  refresh: string,
  user: user
}

export interface meResponse extends user{}

export interface createLetter {
  letterCount: string
  chalaniNo: number
  voucherNo: number
  gatepassNo?: number
  date: string
  receiverOfficeName: string
  receiverAddress: string
  subject: string
  requestChalaniNumber: string
  requestLetterCount: string
  requestDate: string
  items: Array<{
    name: string
    company: string
    serial_number: number
    unit_of_measurement: string
    quantity: number
    remarks?: string
  }>
  receiver: {
    name: string
    post: string
    id_card_number: string
    id_card_type: "national_id" | "citizenship" | "voter_id" | "passport" | "drivers_license" | "pan_card" | "unknown"
    office_name: string
    office_address: string
    phone_number: string
    vehicle_number: string
  }
}
