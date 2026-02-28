import axiosInstance from "@/lib/axios";

export const productionOrderService = {
    getAll: async (params?: { start_date?: string; end_date?: string; status?: string }) => {
        const response = await axiosInstance.get("/api/v1/production-orders", { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/production-orders/${id}`);
        return response.data;
    },

    create: async (data: {
        product_id: number | string;
        bom_id: number | string;
        warehouse_id: number | string;
        production_date: string;
        quantity_plan: number;
        notes?: string;
    }) => {
        const response = await axiosInstance.post("/api/v1/production-orders", data);
        return response.data;
    },

    update: async (id: number | string, data: {
        production_date: string;
        quantity_plan: number;
        notes?: string;
    }) => {
        const response = await axiosInstance.put(`/api/v1/production-orders/${id}`, data);
        return response.data;
    },

    release: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/production-orders/${id}/release`);
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/api/v1/production-orders/${id}`);
        return response.data;
    },

    restore: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/production-orders/${id}/restore`);
        return response.data;
    },
};
