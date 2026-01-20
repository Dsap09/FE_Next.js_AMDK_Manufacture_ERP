// src/services/unitService.ts
import axiosInstance from "@/lib/axios";

export interface UnitData {
  id?: number;
  kode: string;
  name: string;
  description?: string;
}

export const unitService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/units");
    return response.data;
  },
  create: async (data: UnitData) => {
    const response = await axiosInstance.post("/api/v1/units", data);
    return response.data;
  },
  update: async (id: number, data: Partial<UnitData>) => {
    const response = await axiosInstance.put(`/api/v1/units/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/units/${id}`);
    return response.data;
  }
};