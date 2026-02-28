import axiosInstance from "@/lib/axios";

export const bomService = {
    getAll: async (params?: { product_id?: number | string; is_active?: boolean }) => {
        const response = await axiosInstance.get("/api/v1/bill-of-materials", { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/bill-of-materials/${id}`);
        return response.data;
    },

    create: async (data: {
        product_id: number | string;
        batch_size: number;
        notes?: string;
        items: {
            raw_material_id: number | string;
            quantity: number;
            unit_id?: number | string;
        }[];
    }) => {
        const response = await axiosInstance.post("/api/v1/bill-of-materials", data);
        return response.data;
    },

    update: async (id: number | string, data: {
        batch_size: number;
        notes?: string;
        is_active?: boolean;
        items: {
            raw_material_id: number | string;
            quantity: number;
            unit_id?: number | string;
        }[];
    }) => {
        const response = await axiosInstance.put(`/api/v1/bill-of-materials/${id}`, data);
        return response.data;
    },

    updateItem: async (bomId: number | string, itemId: number | string, data: { quantity: number }) => {
        const response = await axiosInstance.put(`/api/v1/bill-of-materials/${bomId}/items/${itemId}`, data);
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/api/v1/bill-of-materials/${id}`);
        return response.data;
    },

    restore: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/bill-of-materials/${id}/restore`);
        return response.data;
    },

    calculateCost: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/bill-of-materials/${id}/calculate-cost`);
        return response.data;
    },
};
