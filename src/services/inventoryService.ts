// src/services/inventoryService.ts
import axiosInstance from "@/lib/axios";

export const inventoryService = {
  // Mengambil ringkasan stok untuk kartu statistik
  getStockSummary: async () => {
    const response = await axiosInstance.get("/api/v1/inventory/summary");
    return response.data;
  },
  // Mengambil daftar stok per produk
  getCurrentStock: async () => {
    const response = await axiosInstance.get("/api/v1/inventory/current-stock");
    return response.data;
  }
};