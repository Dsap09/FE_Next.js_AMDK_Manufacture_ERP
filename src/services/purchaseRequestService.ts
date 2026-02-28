import axiosInstance from "@/lib/axios";

export const purchaseRequestService = {
  /**
   * Mengambil semua daftar Purchase Request (untuk tabel utama)
   */
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/purchase-requests");
    return response.data;
  },

  /**
   * Mengambil detail satu PR beserta daftar barangnya (Eager Loading)
   * Digunakan di halaman Purchase-Request-Item untuk menampilkan tabel
   */
  getById: async (id: number | string) => {
    const response = await axiosInstance.get(`/api/v1/purchase-requests/${id}`);
    return response.data;
  },

  /**
   * Membuat header Purchase Request baru (tanpa item)
   */
  create: async (data: any) => {
    const response = await axiosInstance.post("/api/v1/purchase-requests", data);
    return response.data;
  },

  /**
   * Update data header PR (seperti departemen atau tanggal)
   */
  update: async (id: number | string, data: any) => {
    const response = await axiosInstance.put(`/api/v1/purchase-requests/${id}`, data);
    return response.data;
  },

  /**
   * Mengirim (Submit) PR agar status berubah dari Draft ke Pending/Sent
   */
  submit: async (id: number | string) => {
    const response = await axiosInstance.post(`/api/v1/purchase-requests/${id}/submit`);
    return response.data;
  },

  /**
   * Menyetujui (Approve) PR oleh Manager/Admin
   */
  approve: async (id: number | string) => {
    const response = await axiosInstance.post(`/api/v1/purchase-requests/${id}/approve`);
    return response.data;
  },

  /**
   * Menolak (Reject) PR oleh Manager/Admin
   */
  reject: async (id: number | string) => {
    const response = await axiosInstance.post(`/api/v1/purchase-requests/${id}/reject`);
    return response.data;
  },

  /**
   * Menghapus (Soft Delete) PR
   */
  delete: async (id: number | string) => {
    const response = await axiosInstance.delete(`/api/v1/purchase-requests/${id}`);
    return response.data;
  },
};