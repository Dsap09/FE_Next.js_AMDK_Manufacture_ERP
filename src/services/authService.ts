import axiosInstance from "@/lib/axios";

export const authService = {
  login: async (credentials: any) => {
    // Sesuaikan path ini dengan endpoint login di backend kamu (misal: /api/login)
    const response = await axiosInstance.post("/api/v1/login", credentials); 
    return response.data;
  },
};