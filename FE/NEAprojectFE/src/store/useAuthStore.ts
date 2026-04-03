import { create } from "zustand";
import type { meResponse, user } from "../interfaces/interfaces";
import api from "../utils/api";

export interface AuthState {
	accessToken: string | null;
	user: user | null;
	setAuth: (token: string, user: user) => void;
	setUser: (user: user) => void;
	clearAuth: () => void;
	getUser: () => Promise<meResponse>;
	isAdmin: () => boolean;
	isCreator: () => boolean;
	isViewer: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
	accessToken: localStorage.getItem("accessToken"),
	user: null,
	setAuth: (token: string, user: user) => {
		localStorage.setItem("accessToken", token);
		set({ accessToken: token, user });
	},
	setUser: (user: user) => {
		set({ user: user });
	},
	getUser: async (): Promise<meResponse> => {
		const res = await api.get<meResponse>("/api/auth/me/");
		set({ user: res.data });
		return res.data;
	},
	isAdmin: () => get().user?.role === "admin",
	isCreator: () => get().user?.role === "creator",
	isViewer: () => get().user?.role === "viewer",
	clearAuth: () => {
		localStorage.removeItem("accessToken");
		set({ accessToken: null, user: null });
	},
}));

export default useAuthStore;
