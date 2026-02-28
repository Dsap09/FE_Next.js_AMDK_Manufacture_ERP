import axiosInstance from "@/lib/axios";

export const purchaseReturnService = {
    /**
     * Mengambil semua Purchase Return dengan filter optional
     */
    getAll: async (params?: {
        start_date?: string;
        end_date?: string;
        status?: string;
        supplier_id?: number | string;
    }) => {
        const response = await axiosInstance.get("/api/v1/purchase-returns", { params });
        return response.data;
    },

    /**
     * Mengambil detail Purchase Return berdasarkan ID
     */
    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/purchase-returns/${id}`);
        return response.data;
    },

    /**
     * Membuat Purchase Return baru
     */
    create: async (data: {
        goods_receipt_id?: number;
        purchase_order_id: number;
        warehouse_id: number;
        return_date: string;
        delivery_note_number?: string;
        vehicle_number?: string;
        reason: string;
        notes?: string;
        items: Array<{
            raw_material_id?: number;
            product_id?: number;
            unit_id: number;
            quantity_return: number;
            reason?: string;
            notes?: string;
        }>;
    }) => {
        const response = await axiosInstance.post("/api/v1/purchase-returns", data);
        return response.data;
    },

    /**
     * Update Purchase Return (hanya yang status draft)
     */
    update: async (
        id: number | string,
        data: {
            return_date: string;
            warehouse_id: number;
            delivery_note_number?: string;
            vehicle_number?: string;
            reason: string;
            notes?: string;
        }
    ) => {
        const response = await axiosInstance.put(`/api/v1/purchase-returns/${id}`, data);
        return response.data;
    },

    /**
     * Submit Return (draft → pending)
     */
    submit: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/purchase-returns/${id}/submit`);
        return response.data;
    },

    /**
     * Approve Return (pending → approved)
     */
    approve: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/purchase-returns/${id}/approve`);
        return response.data;
    },

    /**
     * Reject Return (pending → rejected)
     */
    reject: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/purchase-returns/${id}/reject`);
        return response.data;
    },

    /**
     * Realize Return - potong stock (approved → realized)
     */
    realize: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/purchase-returns/${id}/realize`);
        return response.data;
    },

    /**
     * Complete Return - barang sudah dikirim ke supplier (realized → completed)
     */
    complete: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/purchase-returns/${id}/complete`);
        return response.data;
    },

    /**
     * Delete Purchase Return (soft delete)
     */
    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/api/v1/purchase-returns/${id}`);
        return response.data;
    },

    /**
     * Restore Purchase Return yang sudah dihapus
     */
    restore: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/purchase-returns/${id}/restore`);
        return response.data;
    },

    /**
     * Helper: Ambil daftar PO yang bisa diretur (status received/closed)
     */
    getReturnablePOs: async () => {
        const response = await axiosInstance.get("/api/v1/purchase-returns-helpers/returnable-pos");
        return response.data;
    },

    /**
     * Helper: Ambil items dari Goods Receipt yang bisa diretur
     */
    getReturnableItems: async (goodsReceiptId: number | string) => {
        const response = await axiosInstance.get(
            `/api/v1/purchase-returns-helpers/returnable-items/${goodsReceiptId}`
        );
        return response.data;
    },
};
