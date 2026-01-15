import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
    token: string | null;
    user: any | null;
    setToken: (token: string) => void;
    setUser: (user: any) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
