import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import type { UserResource } from "@/services/generated/apiTypes";

type AuthStore = {
    token: string | null;
    user: UserResource | null;
    setToken: (token: string) => void;
    setUser: (user: UserResource) => void;
    logout: () => void;
};

const SecureStorage: StateStorage = {
    getItem: async (key: string): Promise<string | null> => {
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        await SecureStore.deleteItemAsync(key);
    },
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token: string) => set({ token }),
            setUser: (user: UserResource) => set({ user }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => SecureStorage),
        },
    ),
);