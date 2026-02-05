import axiosInstance from "@/lib/axios";

export const stockRequestService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/stock-requests");
    return response.data;
  },
  
  // Fungsi create hanya didefinisikan satu kali
  create: async (data: any) => {
    const response = await axiosInstance.post("/api/v1/stock-requests", data);
    return response.data;
  },

  getById: async (id: number) => {
    // Diubah ke endpoint stock-requests agar konsisten dengan service ini
    const response = await axiosInstance.get(`/api/v1/stock-requests/${id}`);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/v1/stock-requests/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/stock-requests/${id}`);
    return response.data;
  },

  approve: async (id: number) => {
    const response = await axiosInstance.post(`/api/v1/stock-requests-approval/${id}/approve`);
    return response.data;
  },

  reject: async (id: number) => {
    const response = await axiosInstance.post(`/api/v1/stock-requests-approval/${id}/reject`);
    return response.data;
  }
};