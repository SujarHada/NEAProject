import { create } from "zustand";
import type { Branch, Employee, Office, Product, Receiver } from "../interfaces/interfaces";
import api from "../utils/api";

interface DataState {
    Branches: Branch[]
    Receivers: Receiver[]
    Products: Product[]
    Offices: Office[]
    Employees: Employee[]
    getBranches: () => void
    getReceivers: () => void
    getProducts: () => void
    getOffices: () => void
    getEmployees: () => void
}
const useDataStore = create<DataState>((set) => (
    {
        Branches: [],
        Receivers: [],
        Products: [],
        Offices: [],
        Employees: [], getBranches: async () => {
            const res = await api.get<{data:Branch[]}>('/api/branches/all-active/')
            set({Branches:res.data.data})
        },
        getReceivers: async () => {
            const res = await api.get<{data:Receiver[]}>('/api/receivers/all-active/')
            set({Receivers:res.data.data})
        },
        getProducts: async () => {
            const res = await api.get<{data:Product[]}>('/api/products/all-active/')
            set({Products:res.data.data})
        },
        getEmployees: async () => {
            const res = await api.get<{data:Employee[]}>('/api/employees/all-active/')
            set({Employees:res.data.data})
        },
        getOffices: async () => {
            const res = await api.get<{data:Office[]}>('/api/offices/all-active/')
            set({Offices:res.data.data})
        },

    }
))
export default useDataStore