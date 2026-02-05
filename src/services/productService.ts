// src/services/productService.ts
import axiosInstance from "@/lib/axios";

// Definisi interface yang sudah disesuaikan
interface ProductData {
  kode: string;
  name: string;
  unit_id: number;
  tipe: string;
  volume: number; // PERUBAHAN: Sekarang menggunakan number
  harga: number;
  is_returnable: boolean;
}

export const productService = {
  // Mengambil semua data produk
  getAll: async () => { 
    const response = await axiosInstance.get("/api/v1/products");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/v1/products/${id}`);
    return response.data;
  },
  // Menambah produk baru
  createProduct: async (data: ProductData) => {
    const response = await axiosInstance.post("/api/v1/products", data);
    return response.data;
  },

  // Memperbarui produk
  updateProduct: async (id: number, data: Partial<ProductData>) => {
    const response = await axiosInstance.put(`/api/v1/products/${id}`, data);
    return response.data;
  },

  // Menghapus produk
  deleteProduct: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/products/${id}`);
    return response.data;
  }
};