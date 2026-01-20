// src/services/warehouseService.ts
import axiosInstance from "@/lib/axios";

export interface WarehouseData {
  id?: number;
  kode: string;
  name: string;
  lokasi: string;
  deskripsi: string;
}

export const warehouseService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/warehouses");
    return response.data;
  },
  create: async (data: WarehouseData) => {
    const response = await axiosInstance.post("/api/v1/warehouses", data);
    return response.data;
  },
  update: async (id: number, data: Partial<WarehouseData>) => {
    const response = await axiosInstance.put(`/api/v1/warehouses/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/warehouses/${id}`);
    return response.data;
  }
};