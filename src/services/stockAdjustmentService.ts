import axiosInstance from "@/lib/axios";

export const stockAdjustmentService = {
  // Product Adjustments
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/stock-adjustments");
    return response.data;
  },
  create: async (data: any) => {
    const response = await axiosInstance.post("/api/v1/stock-adjustments", data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/api/v1/stock-adjustments/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/stock-adjustments/${id}`);
    return response.data;
  },

  // Raw Material Adjustments
  getRawMaterials: async () => {
    const response = await axiosInstance.get("/api/v1/raw-material-stock-adjustments");
    return response.data;
  },
  createRawMaterial: async (data: any) => {
    const response = await axiosInstance.post("/api/v1/raw-material-stock-adjustments", data);
    return response.data;
  },
  deleteRawMaterial: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/raw-material-stock-adjustments/${id}`);
    return response.data;
  }
};