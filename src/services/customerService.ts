// src/services/customerService.ts
import axiosInstance from "@/lib/axios";

export interface CustomerPayload {
    name: string;
    address: string;
    type: "distributor" | "agent" | "retail";
}

export const customerService = {
    getAll: async () => {
        const response = await axiosInstance.get("/api/v1/customer");
        return response.data;
    },
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/customer/${id}`);
        return response.data;
    },
    store: async (data: CustomerPayload) => {
        const response = await axiosInstance.post("/api/v1/customer", data);
        return response.data;
    },
    update: async (id: number, data: Partial<CustomerPayload>) => {
        const response = await axiosInstance.put(`/api/v1/customer/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/api/v1/customer/${id}`);
        return response.data;
    },
    restore: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/customer/${id}/restore`);
        return response.data;
    }
};
