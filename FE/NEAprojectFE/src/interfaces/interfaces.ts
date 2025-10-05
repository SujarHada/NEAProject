export interface BranchFormInputs {
    orgId: string
    branchName: string
    email: string
    address: string
    bankName: string
    accName: string
    accNo: string
    phNo: string
}

export interface createProductInputs {
    name: string
    companyName: string
    purchasePrice: number | null
    sellingPrice: number | null
    discountedPrice?: number | null
    unit: string
}

export interface Product {
    name: string
    SN: number
    SKU_ID: string
    companyName: string
    purchasePrice: number
    sellingPrice: number
    discountedPrice?: number | null
    unit: string
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