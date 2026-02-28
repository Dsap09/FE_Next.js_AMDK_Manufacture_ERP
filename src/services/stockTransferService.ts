// src/services/stockTransferService.ts
import axiosInstance from "@/lib/axios";

export interface StockTransferItem {
    product_id?: number | null;
    raw_material_id?: number | null;
    quantity: number;
}

export interface StockTransferPayload {
    dari_warehouse_id: number;
    ke_warehouse_id: number;
    transfer_date: string;
    notes?: string;
    items: StockTransferItem[];
}

export const stockTransferService = {
    getAll: async () => {
        const response = await axiosInstance.get("/api/v1/stock-transfers");
        return response.data;
    },
    store: async (data: StockTransferPayload) => {
        const response = await axiosInstance.post("/api/v1/stock-transfers", data);
        return response.data;
    },
    approve: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/stock-transfers/${id}/approve`);
        return response.data;
    },
    reject: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/stock-transfers/${id}/reject`);
        return response.data;
    },
    execute: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/stock-transfers/${id}/execute`);
        return response.data;
    },
};
