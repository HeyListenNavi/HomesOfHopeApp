import api from "./api";
import { Pagination } from "@/types/api";

export class CrudService<T> {
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async getAll(
        page = 1,
        params: Record<string, any> = {},
    ): Promise<Pagination<T>> {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());

        Object.keys(params).forEach((key) => {
            queryParams.append(key, params[key].toString());
        });

        const response = await api.get<Pagination<T>>(
            `${this.endpoint}?${queryParams.toString()}`,
        );
        return response.data;
    }

    async getById(id: number): Promise<T> {
        const response = await api.get<T>(`${this.endpoint}/${id}`);
        return response.data;
    }

    async create(data: Partial<T>): Promise<T> {
        const response = await api.post<T>(this.endpoint, data);
        return response.data;
    }

    async upload(formData: FormData): Promise<T> {
        const response = await api.post<T>(this.endpoint, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        const response = await api.put<T>(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`${this.endpoint}/${id}`);
    }
}
