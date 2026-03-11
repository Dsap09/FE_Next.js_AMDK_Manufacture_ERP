// src/services/salesOrderService.ts
import axiosInstance from "@/lib/axios";

export interface SalesOrderItemPayload {
    product_id: number;
    qty: number;
    price: number;
}

export interface SalesOrderPayload {
    tanggal: string;
    customer_id: number;
    notes?: string;
    items: SalesOrderItemPayload[];
}

export const salesOrderService = {
    getAll: async (params?: Record<string, any>) => {
        const response = await axiosInstance.get("/api/v1/sales-orders", { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-orders/${id}`);
        return response.data;
    },
    store: async (data: SalesOrderPayload) => {
        const response = await axiosInstance.post("/api/v1/sales-orders", data);
        return response.data;
    },
    update: async (id: number, data: Partial<SalesOrderPayload> & { status?: string }) => {
        const response = await axiosInstance.put(`/api/v1/sales-orders/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/api/v1/sales-orders/${id}`);
        return response.data;
    },
    restore: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-orders/${id}/restore`);
        return response.data;
    },
    getOutstandingItems: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-orders/${id}/outstanding`);
        return response.data;
    },
    printPdf: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-orders/${id}/print`, {
            responseType: 'blob' // Important for PDF download
        });
        return response.data;
    }
};
