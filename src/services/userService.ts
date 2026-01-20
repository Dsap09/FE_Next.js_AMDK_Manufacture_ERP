// src/services/userService.ts
import axiosInstance from "@/lib/axios";

export interface UserData {
  id?: number;
  name: string;
  email: string;
  password?: string; // Opsional saat edit
  role: string;
}

export const userService = {
  getAllUsers: async () => {
    const response = await axiosInstance.get("/api/v1/users");
    return response.data;
  },
  createUser: async (data: UserData) => {
    const response = await axiosInstance.post("/api/v1/users", data);
    return response.data;
  },
  updateUser: async (id: number, data: Partial<UserData>) => {
    const response = await axiosInstance.put(`/api/v1/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: number) => {
    const response = await axiosInstance.delete(`/api/v1/users/${id}`);
    return response.data;
  }
};