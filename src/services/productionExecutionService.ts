import axiosInstance from "@/lib/axios";

export const productionExecutionService = {
    // List all executions (in_progress, completed)
    getAll: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/production-executions", { params });
        return response.data;
    },

    // Retrieve active orders that are 'released' and ready to start
    getReadyOrders: async () => {
        const response = await axiosInstance.get("/api/v1/production-orders", { params: { status: 'released' } });
        return response.data;
    },

    // Retrieve active orders that are 'in_progress' and ready to complete
    getInProgressOrders: async () => {
        const response = await axiosInstance.get("/api/v1/production-orders", { params: { status: 'in_progress' } });
        return response.data;
    },

    start: async (productionOrderId: number | string, data: { started_at: string; operator: string }) => {
        const response = await axiosInstance.post(`/api/v1/production-executions/${productionOrderId}/start`, data);
        return response.data;
    },

    complete: async (productionOrderId: number | string, data: {
        quantity_actual: number;
        quantity_waste?: number;
        completed_at: string;
        labor_cost?: number;
        overhead_cost?: number;
        notes?: string;
    }) => {
        const response = await axiosInstance.post(`/api/v1/production-executions/${productionOrderId}/complete`, data);
        return response.data;
    },

    getReport: async (productionOrderId: number | string) => {
        const response = await axiosInstance.get(`/api/v1/production-executions/${productionOrderId}/report`);
        return response.data;
    },
};
