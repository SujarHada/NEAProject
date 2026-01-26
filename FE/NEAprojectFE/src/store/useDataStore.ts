import { create } from "zustand";
import type {
	Branch,
	Employee,
	LetterCreationData,
	Office,
	Product,
	Receiver,
} from "../interfaces/interfaces";
import api from "../utils/api";

interface DataState {
	Branches: Branch[];
	Receivers: Receiver[];
	Products: Product[];
	Offices: Office[];
	Employees: Employee[];
	LetterCreationData: LetterCreationData | null;
	getBranches: () => void;
	getReceivers: () => void;
	getProducts: () => void;
	getOffices: () => void;
	getEmployees: () => void;
	getLetterCreationData: () => void;
}
const useDataStore = create<DataState>((set) => ({
	Branches: [],
	Receivers: [],
	Products: [],
	Offices: [],
	Employees: [],
	LetterCreationData: null,
	getBranches: async () => {
		const res = await api.get<{ data: Branch[] }>("/api/branches/all-active/");
		set({ Branches: res.data.data });
	},
	getReceivers: async () => {
		const res = await api.get<{ data: Receiver[] }>(
			"/api/receivers/all-active/",
		);
		set({ Receivers: res.data.data });
	},
	getProducts: async () => {
		const res = await api.get<{ data: Product[] }>("/api/products/all-active/");
		set({ Products: res.data.data });
	},
	getEmployees: async () => {
		const res = await api.get<{ data: Employee[] }>(
			"/api/employees/all-active/",
		);
		set({ Employees: res.data.data });
	},
	getOffices: async () => {
		const res = await api.get<{ data: Office[] }>("/api/offices/all-active/");
		set({ Offices: res.data.data });
	},
	getLetterCreationData: async () => {
		const res = await api.get<LetterCreationData>(
			"/api/letters/letter-creation-data/",
		);
		set({ LetterCreationData: res.data });
	},
}));
export default useDataStore;
