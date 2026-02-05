import axiosInstance from "@/lib/axios";

export const purchaseRequestItemService = {
  /**
   * Simpan banyak item sekaligus (Bulk Store)
   * Digunakan saat user klik "Simpan Items Baru" di halaman detail
   */
  store: async (payload: { purchase_request_id: number; items: any[] }) => {
    const response = await axiosInstance.post("/api/v1/purchase-request-items", payload);
    return response.data;
  },

  /**
   * Update kuantitas atau catatan pada baris item tertentu
   */
  update: async (id: number | string, data: { quantity: number; notes?: string; reference_no?: string }) => {
    const response = await axiosInstance.put(`/api/v1/purchase-request-items/${id}`, data);
    return response.data;
  },

  /**
   * Menghapus item tertentu dari daftar Purchase Request
   */
  destroy: async (id: number | string) => {
    const response = await axiosInstance.delete(`/api/v1/purchase-request-items/${id}`);
    return response.data;
  },
};