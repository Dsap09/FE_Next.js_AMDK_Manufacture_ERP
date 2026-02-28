import axiosInstance from "@/lib/axios";

export const stockMovementService = {
    /**
     * Get all stock movements (Product & Raw Material combined)
     */
    getAll: async (params?: any) => {
        const response = await axiosInstance.get("/api/v1/stock-tracking", { params });
        return response.data;
    },

    /**
     * Get stock summary (current stock for all items)
     */
    getStockSummary: async (params?: any) => {
        const response = await axiosInstance.get("/api/v1/stock-summary", { params });
        return response.data;
    },

    /**
     * Create new stock movement
     */
    create: async (data: {
        category: "product" | "raw_material";
        item_id: number;
        warehouse_id: number;
        type: string;
        quantity: number;
        notes?: string;
    }) => {
        const response = await axiosInstance.post("/api/v1/stock-movements", data);
        return response.data;
    },
};
