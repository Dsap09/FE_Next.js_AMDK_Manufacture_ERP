import axiosInstance from "@/lib/axios";

export const stockOutService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/stock-outs");
    return response.data;
  },
  create: async (data: any) => {
    const response = await axiosInstance.post("/api/v1/stock-outs", data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/v1/stock-outs/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/stock-outs/${id}`);
    return response.data;
  }
};