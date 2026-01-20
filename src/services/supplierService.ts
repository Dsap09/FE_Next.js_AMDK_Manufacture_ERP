// src/services/supplierService.ts
import axiosInstance from "@/lib/axios";

export interface SupplierData {
  id?: number;
  nama: string;
  email: string;
  alamat: string;
  telepon: string;
  kontak_person: string;
}

export const supplierService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/v1/suppliers");
    return response.data;
  },
  create: async (data: SupplierData) => {
    const response = await axiosInstance.post("/api/v1/suppliers", data);
    return response.data;
  },
  update: async (id: number, data: Partial<SupplierData>) => {
    const response = await axiosInstance.put(`/api/v1/suppliers/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/suppliers/${id}`);
    return response.data;
  }
};