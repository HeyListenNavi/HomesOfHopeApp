import api from "./api";
import { FamilyProfile, Pagination } from "@/types/api";

export const familyService = {
    getAll: async (page = 1): Promise<Pagination<FamilyProfile>> => {
        const response = await api.get<Pagination<FamilyProfile>>(
            `/family-profiles?page=${page}`
        );
        return response.data;
    },

    getNext: async (
        currentPage: number
    ): Promise<Pagination<FamilyProfile>> => {
        return familyService.getAll(currentPage + 1);
    },

    getPrevious: async (
        currentPage: number
    ): Promise<Pagination<FamilyProfile>> => {
        const prevPage = currentPage > 1 ? currentPage - 1 : 1;
        return familyService.getAll(prevPage);
    },

    getById: async (id: number): Promise<FamilyProfile> => {
        const response = await api.get<FamilyProfile>(`/family-profiles/${id}`);
        console.log(response.data);
        return response.data;
    },

    create: async (data: Partial<FamilyProfile>): Promise<FamilyProfile> => {
        const response = await api.post<FamilyProfile>(
            "/family-profiles",
            data
        );
        return response.data;
    },

    search: async (query: string): Promise<Pagination<FamilyProfile>> => {
        const response = await api.get<Pagination<FamilyProfile>>(
            `/family-profiles?search=${query}`
        );
        return response.data;
    },
};
