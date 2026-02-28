import axiosInstance from "@/lib/axios";

export const inventoryReportService = {
    /**
     * Kartu Persediaan - Product
     */
    getProducts: async (params?: { start_date?: string; end_date?: string; search?: string }) => {
        const response = await axiosInstance.get("/api/v1/inventory/products", { params });
        return response.data;
    },

    /**
     * Kartu Persediaan - Raw Material
     */
    getRawMaterials: async (params?: { start_date?: string; end_date?: string; search?: string }) => {
        const response = await axiosInstance.get("/api/v1/inventory/raw-materials", { params });
        return response.data;
    },

    /**
     * Laporan Barang Masuk
     */
    getIncomingReport: async (params?: { start_date?: string; end_date?: string; search?: string }) => {
        const response = await axiosInstance.get("/api/v1/inventory/incoming-report", { params });
        return response.data;
    },

    /**
     * Laporan Barang Keluar
     */
    getOutgoingReport: async (params?: { start_date?: string; end_date?: string; search?: string }) => {
        const response = await axiosInstance.get("/api/v1/inventory/outgoing-report", { params });
        return response.data;
    },
};
