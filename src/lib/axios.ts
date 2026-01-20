import axios from "axios";

const axiosInstance = axios.create({
  // Gunakan fallback "/" agar tidak error jika env tidak terbaca
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/", 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "69420", 
  },
});

// Interceptor untuk menyisipkan token secara otomatis
axiosInstance.interceptors.request.use((config) => {
  // --- PERBAIKAN DI SINI ---
  // Cek apakah kode sedang berjalan di browser
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;