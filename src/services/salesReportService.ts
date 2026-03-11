import axiosInstance from "@/lib/axios";

export const salesReportService = {
    getResume: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/resume", { params });
        return response.data;
    },

    getByProduct: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/by-product", { params });
        return response.data;
    },

    getByCustomer: async (params?: { start_date?: string; end_date?: string; payment_status?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/by-customer", { params });
        return response.data;
    },

    getMonthlyTrend: async (params?: { year?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/monthly-trend", { params });
        return response.data;
    },

    downloadProductReportPdf: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/by-product/pdf", {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    downloadCustomerReportPdf: async (params?: { start_date?: string; end_date?: string; payment_status?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/by-customer/pdf", {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    downloadAgingReportPdf: async () => {
        const response = await axiosInstance.get("/api/v1/sales-report/report-aging", {
            responseType: 'blob'
        });
        return response.data;
    }
};
