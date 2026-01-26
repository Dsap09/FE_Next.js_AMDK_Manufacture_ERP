import axiosInstance from "@/lib/axios";

export const stockRequestService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/stock-requests");
    return response.data;
  },
  create: async (data: any) => {
    // Data format: { request_date, notes, items: [{ product_id, quantity }] }
    const response = await axiosInstance.post("/api/v1/stock-requests", data);
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
    const response = await axiosInstance.post(`/api/v1/stock-requests/${id}/approve`);
    return response.data;
  },
  reject: async (id: number) => {
    const response = await axiosInstance.post(`/api/v1/stock-requests/${id}/reject`);
    return response.data;
  },
  setDraft: async (id: number) => {
    const response = await axiosInstance.post(`/api/v1/stock-requests/${id}/draft`);
    return response.data;
  },
};