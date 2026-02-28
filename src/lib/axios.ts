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

// Interceptor untuk logging error yang lebih detail
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("=== FULL ERROR OBJECT ===", error);

    if (error.response) {
      // Server responded with error status
      console.error("API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      });
    } else if (error.request) {
      // Request was made but no response
      console.error("API No Response:", {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: "No response from server - Check if backend is running",
        request: error.request,
      });
    } else {
      // Something else happened
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;