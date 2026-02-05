import axiosInstance from "@/lib/axios";

export const stockInitialService = {
  // Mengirim data ke POST /api/v1/initial-stocks
  create: async (payload: { warehouse_id: number; items: { product_id: number; quantity: number }[] }) => {
    const response = await axiosInstance.post("/api/v1/initial-stocks", payload);
    return response.data;
  },
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/stock-initials"); 
      // Kita return response.data karena biasanya Laravel membungkusnya di sana
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};