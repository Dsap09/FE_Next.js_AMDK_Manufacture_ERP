// src/services/initialBalanceService.ts
import axiosInstance from "@/lib/axios";

export interface InitialBalanceItem {
    account_id: number;
    debit: number;
    credit: number;
    budget?: number;
}

export interface InitialBalancePayload {
    year: number;
    items: InitialBalanceItem[];
}

export const initialBalanceService = {
    getAll: async (params?: { year?: number; status?: string }) => {
        const response = await axiosInstance.get("/api/v1/initial-balances", { params });
        return response.data;
    },
    getYears: async () => {
        const response = await axiosInstance.get("/api/v1/initial-balances/years");
        return response.data;
    },
    getByYear: async (year: number) => {
        const response = await axiosInstance.get(`/api/v1/initial-balances/${year}`);
        return response.data;
    },
    store: async (data: InitialBalancePayload) => {
        const response = await axiosInstance.post("/api/v1/initial-balances", data);
        return response.data;
    },
    approve: async (year: number) => {
        const response = await axiosInstance.post(`/api/v1/initial-balances/${year}/approve`);
        return response.data;
    },
    destroy: async (year: number) => {
        const response = await axiosInstance.delete(`/api/v1/initial-balances/${year}`);
        return response.data;
    },
};
