import { create } from "zustand";
import type { user } from "../interfaces/interfaces";

interface AuthState {
  accessToken: string | null;
  user: user | null;
  setAuth: (token: string, user: user) => void;
  setUser:(user:user) => void
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  user: null,
  setAuth: (token:string, user:user) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token, user });
  },
  setUser: (user:user)=>{
    set({user:user})
},  
clearAuth: () => {
    localStorage.removeItem("accessToken");
    set({ accessToken: null, user: null });
  },
}));

export default useAuthStore;
