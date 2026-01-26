import { create } from "zustand";
import type { meResponse, user } from "../interfaces/interfaces";
import api from "../utils/api";

interface AuthState {
	accessToken: string | null;
	user: user | null;
	setAuth: (token: string, user: user) => void;
	setUser: (user: user) => void;
	clearAuth: () => void;
	getUser: () => Promise<meResponse>;
}

const useAuthStore = create<AuthState>((set) => ({
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
	clearAuth: () => {
		localStorage.removeItem("accessToken");
		set({ accessToken: null, user: null });
	},
}));

export default useAuthStore;
