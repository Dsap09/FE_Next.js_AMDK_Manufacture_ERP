import axiosInstance from "@/lib/axios";

export const purchaseOrderService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/purchase-orders");
    return response.data; // Mengambil data PO
  },
  
  // Membuat PO dari PR yang sudah disetujui
  generateFromPR: async (prId: number) => {
    const response = await axiosInstance.post(`/api/v1/purchase-orders/generate/${prId}`);
    return response.data; //
  },

  // Update Supplier dan Tanggal (Hanya untuk status Draft)
  update: async (id: number, payload: any) => {
    const response = await axiosInstance.put(`/api/v1/purchase-orders/${id}`, payload);
    return response.data; //
  },

  // Update Harga Item (Penting: Backend menghitung subtotal otomatis)
  updateItemPrice: async (itemId: number, price: number) => {
    const response = await axiosInstance.put(`/api/v1/purchase-orders/items/${itemId}/price`, { price });
    return response.data; //
  },

  // Submit PO (Mengubah status menjadi 'sent')
  submit: async (id: number) => {
    const response = await axiosInstance.post(`/api/v1/purchase-orders/${id}/submit`);
    return response.data; //
  },

  // Terima Barang (Mengubah status menjadi 'received')
  receive: async (id: number) => {
    const response = await axiosInstance.post(`/api/v1/purchase-orders/${id}/receive`);
    return response.data; //
  },

  getById: async (id: number | string) => {
    const response = await axiosInstance.get(`/purchase-orders/${id}`);
    return response.data;
  }
};