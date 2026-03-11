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

    getMonthlyTrend: async (params?: { year?: string; start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/monthly-trend", { params });
        return response.data;
    },

    getAging: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/aging", { params });
        return response.data;
    },

    getReturns: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/returns", { params });
        return response.data;
    },

    getInvoiceStatus: async (params?: { start_date?: string; end_date?: string; status?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/invoice-status", { params });
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

    downloadAgingReportPdf: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/aging/pdf", {
            params,
            responseType: 'blob'
        });
        return response.data;
    },

    downloadReturnsReportPdf: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-reports/returns/pdf", {
            params,
            responseType: 'blob'
        });
        return response.data;
    }
};
