import axiosInstance from "@/lib/axios";

export const supplierReportService = {
    getAll: async (params?: { start_date?: string; end_date?: string; supplier_id?: string; status?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/supplier-purchase/supplier", { params });
        return response.data;
    },

    getDetail: async (supplierId: number | string, params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get(`/api/v1/reports/supplier-purchase/${supplierId}/detail`, { params });
        return response.data;
    },

    getTopItems: async (supplierId: number | string, params?: { start_date?: string; end_date?: string; limit?: number }) => {
        const response = await axiosInstance.get(`/api/v1/reports/supplier-purchase/${supplierId}/top-items`, { params });
        return response.data;
    },

    getPerformance: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/supplier-purchase/performance", { params });
        return response.data;
    },

    getMonthlyTrend: async (supplierId: number | string, params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get(`/api/v1/reports/supplier-purchase/${supplierId}/monthly-trend`, { params });
        return response.data;
    },
};

export const ttfReportService = {
    getAll: async (params?: { start_date?: string; end_date?: string; status?: string; supplier_id?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/invoice-receipt/invoice", { params });
        return response.data;
    },

    getDetail: async (receiptId: number | string) => {
        const response = await axiosInstance.get(`/api/v1/reports/invoice-receipt/${receiptId}/detail`);
        return response.data;
    },

    getBySupplier: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/invoice-receipt/by-supplier", { params });
        return response.data;
    },

    getDueInvoices: async (params?: { status?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/invoice-receipt/due-invoices", { params });
        return response.data;
    },

    getAgingReport: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/invoice-receipt/aging", { params });
        return response.data;
    },

    getMonthlyTrend: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/invoice-receipt/monthly-trend", { params });
        return response.data;
    },

    getByRequester: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/invoice-receipt/by-requester", { params });
        return response.data;
    },
};

export const purchaseReturnReportService = {
    getAll: async (params?: { start_date?: string; end_date?: string; status?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/purchase-return/return", { params });
        return response.data;
    },

    getDetail: async (returnId: number | string) => {
        const response = await axiosInstance.get(`/api/v1/reports/purchase-return/${returnId}/detail`);
        return response.data;
    },

    getBySupplier: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/purchase-return/by-supplier", { params });
        return response.data;
    },

    getTopReturnedItems: async (params?: { start_date?: string; end_date?: string; limit?: number }) => {
        const response = await axiosInstance.get("/api/v1/reports/purchase-return/top-returned-items", { params });
        return response.data;
    },

    getByReason: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/purchase-return/by-reason", { params });
        return response.data;
    },

    getMonthlyTrend: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/purchase-return/monthly-trend", { params });
        return response.data;
    },

    getApprovalRate: async (params?: { start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/reports/purchase-return/approval-rate", { params });
        return response.data;
    },
};
