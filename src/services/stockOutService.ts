import axiosInstance from "@/lib/axios";

export const stockOutService = {
  // Mengambil data dari endpoint stock-requests
  getPendingApproval: async () => {
    const response = await axiosInstance.get("/api/v1/stock-requests");
    // Kita filter di service atau di component agar hanya status 'approved' yang tampil
    return response.data;
  },

  // Simpan transaksi stok keluar
  create: async (payload: { 
    stock_request_id: number; 
    warehouse_id: number; 
    out_date: string; 
    notes?: string 
  }) => {
    const response = await axiosInstance.post("/api/v1/stock-outs", payload);
    return response.data;
  }
};