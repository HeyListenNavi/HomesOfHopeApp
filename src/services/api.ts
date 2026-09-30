import Axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { queryClient } from '@/lib/queryClient';
import { router } from 'expo-router';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Request interceptor for auth
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // The stored token is no longer valid; drop the session.
      useAuthStore.getState().logout();
      router.replace('/login');
    }

    if (error.response?.status === 403) {
      // The session is still valid but the policy denied this action. The
      // request is rejected rather than logged out, and the stored permissions
      // are invalidated so the UI stops offering affordances the backend now
      // refuses (for example after a role change).
      queryClient.invalidateQueries({ queryKey: ['getUser'] });
    }

    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return AXIOS_INSTANCE({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;