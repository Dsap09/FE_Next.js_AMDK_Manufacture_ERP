import axiosInstance from "@/lib/axios";

export const goodsReceiptService = {
    /**
     * Mengambil semua Goods Receipt dengan filter optional
     */
    getAll: async (params?: {
        start_date?: string;
        end_date?: string;
        status?: string;
        purchase_order_id?: number | string;
    }) => {
        const response = await axiosInstance.get("/api/v1/goods-receipts", { params });
        return response.data;
    },

    /**
     * Mengambil detail Goods Receipt berdasarkan ID
     */
    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/goods-receipts/${id}`);
        return response.data;
    },

    /**
     * Membuat Goods Receipt baru dari PO
     */
    create: async (data: {
        purchase_order_id: number;
        warehouse_id: number;
        receipt_date: string;
        delivery_note_number?: string;
        vehicle_number?: string;
        type: "GOODS_RECEIPT" | "RETURN";
        notes?: string;
        items: Array<{
            purchase_order_item_id: number;
            quantity_received: number;
            notes?: string;
        }>;
    }) => {
        const response = await axiosInstance.post("/api/v1/goods-receipts", data);
        return response.data;
    },

    /**
     * Update Goods Receipt (hanya yang status draft)
     */
    update: async (
        id: number | string,
        data: {
            receipt_date: string;
            warehouse_id: number;
            delivery_note_number?: string;
            vehicle_number?: string;
            notes?: string;
        }
    ) => {
        const response = await axiosInstance.put(`/api/v1/goods-receipts/${id}`, data);
        return response.data;
    },

    /**
     * Post Goods Receipt (update stock ke warehouse)
     */
    post: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/goods-receipts/${id}/post`);
        return response.data;
    },

    /**
     * Delete Goods Receipt (soft delete)
     */
    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/api/v1/goods-receipts/${id}`);
        return response.data;
    },

    /**
     * Restore Goods Receipt yang sudah dihapus
     */
    restore: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/goods-receipts/${id}/restore`);
        return response.data;
    },
};
