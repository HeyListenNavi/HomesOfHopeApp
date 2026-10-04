import Axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { queryClient } from '@/lib/queryClient';
import { router } from 'expo-router';
import type { GetUser200 } from '@/services/generated/apiTypes';

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
      // The stored session is no longer valid; drop it.
      useAuthStore.getState().logout();
      queryClient.clear();
      router.replace('/login');
    }

    if (error.response?.status === 403) {
      refreshPermissions();
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

export const refreshPermissions = () =>
  queryClient
    .fetchQuery({
      queryKey: ['/user'],
      queryFn: () => customInstance<GetUser200>({ url: '/user', method: 'GET' }),
      staleTime: 0,
    })
    .then((user) => useAuthStore.getState().setUser(user))
    .catch(() => {});

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;