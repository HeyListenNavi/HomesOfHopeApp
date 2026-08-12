import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.157:8000/api";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export const customInstance = <T>(config: AxiosRequestConfig | string, options?: AxiosRequestConfig & { body?: any }): Promise<T> => {
    const finalConfig: any = typeof config === 'string' ? { url: config, ...options } : { ...config, ...options };
    if (finalConfig.body && !finalConfig.data) {
        finalConfig.data = finalConfig.body;
        delete finalConfig.body;
    }
    return api(finalConfig).then(({ data, status }) => ({ data, status }) as T);
};

export default api;
