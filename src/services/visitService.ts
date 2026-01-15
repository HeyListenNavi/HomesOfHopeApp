import api from "./api";
import { Visit, Pagination } from "@/types/api";

export const visitService = {
    getAll: async (page = 1): Promise<Pagination<Visit>> => {
        const response = await api.get<Pagination<Visit>>(
            `/visits?page=${page}`
        );
        return response.data;
    },

    getNext: async (currentPage: number): Promise<Pagination<Visit>> => {
        return visitService.getAll(currentPage + 1);
    },

    getPrevious: async (currentPage: number): Promise<Pagination<Visit>> => {
        const prevPage = currentPage > 1 ? currentPage - 1 : 1;
        return visitService.getAll(prevPage);
    },

    getById: async (id: number): Promise<Visit> => {
        const response = await api.get<Visit>(`/visits/${id}`);
        console.log(response.data);
        return response.data;
    },

    create: async (data: Partial<Visit>): Promise<Visit> => {
        const response = await api.post<Visit>("/visits", data);
        return response.data;
    },

    update: async (id: number, data: Partial<Visit>): Promise<Visit> => {
        const response = await api.put<Visit>(`/visits/${id}`, data);
        return response.data;
    },

    search: async (query: string): Promise<Pagination<Visit>> => {
        const response = await api.get<Pagination<Visit>>(
            `/visits?search=${query}`
        );
        return response.data;
    },
};
