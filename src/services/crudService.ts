import api from "./api";
import { Pagination } from "@/types/api";

export class CrudService<T> {
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async getAll(page = 1, query = ""): Promise<Pagination<T>> {
        const params = new URLSearchParams({
            page: page.toString(),
            ...(query ? { search: query } : {}),
        });

        const response = await api.get<Pagination<T>>(
            `${this.endpoint}?${params}`,
        );
        return response.data;
    }

    async getById(id: number): Promise<T> {
        const response = await api.get<T>(`${this.endpoint}/${id}`);
        console.log(response.data);
        return response.data;
    }

    async create(data: Partial<T>): Promise<T> {
        const response = await api.post<T>(this.endpoint, data);
        return response.data;
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        const response = await api.put<T>(`${this.endpoint}/${id}`, data);
        return response.data;
    }
}
