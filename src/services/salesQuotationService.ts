// src/services/salesQuotationService.ts
import axiosInstance from "@/lib/axios";

export interface SalesQuotationItemPayload {
    product_id: number;
    qty: number;
    price: number;
}

export interface SalesQuotationPayload {
    customer_id: number;
    tanggal: string;
    cara_bayar?: string;
    dp_amount?: number;
    items: SalesQuotationItemPayload[];
}

export const salesQuotationService = {
    getAll: async (params?: Record<string, any>) => {
        const response = await axiosInstance.get("/api/v1/sales-quotations", { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-quotations/${id}`);
        return response.data;
    },
    store: async (data: SalesQuotationPayload) => {
        const response = await axiosInstance.post("/api/v1/sales-quotations", data);
        return response.data;
    },
    update: async (id: number, data: Partial<SalesQuotationPayload> & { status?: string, notes?: string }) => {
        const response = await axiosInstance.put(`/api/v1/sales-quotations/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/api/v1/sales-quotations/${id}`);
        return response.data;
    },
    restore: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-quotations/${id}/restore`);
        return response.data;
    },
    convertToSpk: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-quotations/${id}/convert`);
        return response.data;
    },
    updateStatus: async (id: number, status: string) => {
        const response = await axiosInstance.patch(`/api/v1/sales-quotations/${id}/status`, { status });
        return response.data;
    }
};
