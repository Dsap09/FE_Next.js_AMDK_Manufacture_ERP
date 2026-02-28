// src/services/chartOfAccountService.ts
import axiosInstance from "@/lib/axios";

export interface ChartOfAccountData {
    id?: number;
    code: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    category: string;
    is_cash?: boolean;
    is_active?: boolean;
}

export const chartOfAccountService = {
    getAll: async (params?: { type?: string; category?: string; is_active?: boolean }) => {
        const response = await axiosInstance.get("/api/v1/chart-of-accounts", { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/chart-of-accounts/${id}`);
        return response.data;
    },
    create: async (data: ChartOfAccountData) => {
        const response = await axiosInstance.post("/api/v1/chart-of-accounts", data);
        return response.data;
    },
    update: async (id: number, data: Partial<ChartOfAccountData>) => {
        const response = await axiosInstance.put(`/api/v1/chart-of-accounts/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/api/v1/chart-of-accounts/${id}`);
        return response.data;
    },
    restore: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/chart-of-accounts/${id}/restore`);
        return response.data;
    },
};
