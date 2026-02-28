import axiosInstance from "@/lib/axios";

export const rawMaterialService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/raw-materials");
    return response.data;
  },
  create: async (data: any) => {
    const response = await axiosInstance.post("/api/v1/raw-materials", data);
    return response.data;
  },
  // Tambahkan fungsi Update
  update: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/v1/raw-materials/${id}`, data);
    return response.data;
  },
  // Tambahkan fungsi Delete
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/raw-materials/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await axiosInstance.post(`/api/v1/raw-materials/${id}/status`, { status });
    return response.data;
  },
  getStockInHistory: async () => {
    const response = await axiosInstance.get("/api/v1/raw-material-stock-in");
    return response.data;
  },

  // Simpan transaksi stok masuk baru
  createStockIn: async (payload: any) => {
    const response = await axiosInstance.post("/api/v1/raw-material-stock-in", payload);
    return response.data;
  },

  getStockOutHistory: async () => {
    const response = await axiosInstance.get("/api/v1/raw-material-stock-out");
    return response.data;
  },

  // Simpan transaksi stok keluar baru
  createStockOut: async (payload: any) => {
    const response = await axiosInstance.post("/api/v1/raw-material-stock-out", payload);
    return response.data;
  },

  // Posting Stok Masuk
  postStockIn: async (id: number | string) => {
    const response = await axiosInstance.post(`/api/v1/raw-material-stock-in/${id}/post`);
    return response.data;
  }
};