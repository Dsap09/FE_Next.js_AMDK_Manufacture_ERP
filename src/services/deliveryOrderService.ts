// src/services/deliveryOrderService.ts
import axiosInstance from "@/lib/axios";

export interface DeliveryOrderItemPayload {
    sales_order_item_id: number;
    product_id: number;
    qty: number;
}

export interface DeliveryOrderPayload {
    tanggal: string;
    sales_order_id: number;
    customer_id: number;
    warehouse_id: number;
    no_spk?: string;
    notes?: string;
    status: string; // "draft" or "shipped"
    items: DeliveryOrderItemPayload[];
}

export const deliveryOrderService = {
    getAll: async (params?: Record<string, any>) => {
        const response = await axiosInstance.get("/api/v1/delivery-orders", { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/delivery-orders/${id}`);
        return response.data;
    },
    store: async (data: DeliveryOrderPayload) => {
        const response = await axiosInstance.post("/api/v1/delivery-orders", data);
        return response.data;
    },
    update: async (id: number, data: { tanggal?: string; expedition?: string; vehicle_number?: string; notes?: string }) => {
        const response = await axiosInstance.put(`/api/v1/delivery-orders/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/api/v1/delivery-orders/${id}`);
        return response.data;
    },
    restore: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/delivery-orders/${id}/restore`);
        return response.data;
    },
    sendOrder: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/delivery-orders/${id}/send`);
        return response.data;
    },
    confirmReceived: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/delivery-orders/${id}/confirm-received`);
        return response.data;
    }
};
