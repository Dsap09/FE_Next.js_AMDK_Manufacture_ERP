import axiosInstance from "@/lib/axios";

export const invoiceReceiptService = {
    getAll: async (params?: { start_date?: string; end_date?: string; status?: string; supplier_id?: string }) => {
        const response = await axiosInstance.get("/api/v1/invoice-receipts", { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/invoice-receipts/${id}`);
        return response.data;
    },

    create: async (data: {
        purchase_order_id: number;
        transaction_date: string;
        requester_id: number;
        notes?: string;
        invoice_number: string;
        invoice_date: string;
        due_date: string;
    }) => {
        const response = await axiosInstance.post("/api/v1/invoice-receipts", data);
        return response.data;
    },

    update: async (id: number | string, data: { transaction_date: string; requester_id: number; notes?: string }) => {
        const response = await axiosInstance.put(`/api/v1/invoice-receipts/${id}`, data);
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/api/v1/invoice-receipts/${id}`);
        return response.data;
    },

    restore: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/invoice-receipts/${id}/restore`);
        return response.data;
    },

    // Invoice Management
    addInvoice: async (receiptId: number | string, data: {
        invoice_number: string;
        invoice_date: string;
        due_date: string;
        amount: number;
        notes?: string;
    }) => {
        const response = await axiosInstance.post(`/api/v1/invoice-receipts/${receiptId}/invoices`, data);
        return response.data;
    },

    updateInvoice: async (receiptId: number | string, invoiceId: number | string, data: {
        invoice_number: string;
        invoice_date: string;
        due_date: string;
        amount: number;
        notes?: string;
    }) => {
        const response = await axiosInstance.put(`/api/v1/invoice-receipts/${receiptId}/invoices/${invoiceId}`, data);
        return response.data;
    },

    removeInvoice: async (receiptId: number | string, invoiceId: number | string) => {
        const response = await axiosInstance.delete(`/api/v1/invoice-receipts/${receiptId}/invoices/${invoiceId}`);
        return response.data;
    },

    // Workflow
    submit: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/invoice-receipts/${id}/submit`);
        return response.data;
    },

    approve: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/invoice-receipts/${id}/approve`);
        return response.data;
    },

    reject: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/invoice-receipts/${id}/reject`);
        return response.data;
    },

    // Helpers
    getEligiblePOs: async () => {
        const response = await axiosInstance.get("/api/v1/invoice-receipts-helpers/eligible-pos");
        return response.data;
    },

    getSummary: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/invoice-receipts/${id}/summary`);
        return response.data;
    },

    getPrintUrl: (id: number | string) => {
        return `/print/invoice-receipt/${id}`;
    },
};
