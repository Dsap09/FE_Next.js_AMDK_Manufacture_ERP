import axiosInstance from "@/lib/axios";

export const purchaseOrderService = {
  // Ambil semua PO
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/purchase-orders");
    return response.data;
  },

  // Ambil detail PO berdasarkan ID
  getById: async (id: number | string) => {
    const response = await axiosInstance.get(`/api/v1/purchase-orders/${id}`);
    return response.data;
  },

  /**
   * SESUAIKAN URL INI DENGAN POSTMAN KAMU
   * Contoh: /api/v1/purchase-orders/generate/${prId}
   */
  generateFromPR: async (prId: number | string) => {
    const response = await axiosInstance.post(`/api/v1/purchase-orders/from-pr/${prId}`);
    return response.data;
  },

  // Update Header PO (Supplier, Tanggal, dll)
  update: async (id: number | string, data: any) => {
    const response = await axiosInstance.put(`/api/v1/purchase-orders/${id}`, data);
    return response.data;
  },

  // Update harga item PO satu per satu
  updateItemPrice: async (itemId: number | string, price: number) => {
    const response = await axiosInstance.post(`/api/v1/purchase-orders/item/${itemId}/price`, { price });
    return response.data;
  },

  // Submit PO ke Supplier
  submit: async (id: number | string) => {
    const response = await axiosInstance.post(`/api/v1/purchase-orders/${id}/submit`);
    return response.data;
  },

  // Terima barang (Goods Receipt) - DEPRECATED: gunakan GoodsReceiptService
  receive: async (id: number | string) => {
    const response = await axiosInstance.post(`/api/v1/purchase-orders/${id}/receive`);
    return response.data;
  },

  // Delete PO (soft delete)
  delete: async (id: number | string) => {
    const response = await axiosInstance.delete(`/api/v1/purchase-orders/${id}`);
    return response.data;
  }
};