// src/services/salesReturnService.ts
import axiosInstance from "@/lib/axios";

export interface SalesReturnItemPayload {
    product_id: number;
    qty: number;
    condition: "good" | "damaged" | "reject";
    price: number;
}

export interface SalesReturnPayload {
    sales_invoice_id: number;
    return_date: string;
    reason?: string;
    items: SalesReturnItemPayload[];
}

export const salesReturnService = {
    getAll: async (params?: Record<string, any>) => {
        const response = await axiosInstance.get("/api/v1/sales-returns", { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-returns/${id}`);
        return response.data;
    },
    store: async (data: SalesReturnPayload) => {
        const response = await axiosInstance.post("/api/v1/sales-returns", data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/api/v1/sales-returns/${id}`);
        return response.data;
    },
    restore: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-returns/${id}/restore`);
        return response.data;
    },
    printPdf: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-returns/${id}/print`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
