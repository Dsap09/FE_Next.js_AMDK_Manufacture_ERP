// src/services/salesInvoiceService.ts
import axiosInstance from "@/lib/axios";

export interface SalesInvoicePayload {
    sales_order_id: number;
    payment_type: string; // "full" | "dp"
    dp_amount?: number;
}

export const salesInvoiceService = {
    getAll: async (params?: Record<string, any>) => {
        const response = await axiosInstance.get("/api/v1/sales-invoices", { params });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-invoices/${id}`);
        return response.data;
    },
    store: async (data: SalesInvoicePayload) => {
        const response = await axiosInstance.post("/api/v1/sales-invoices", data);
        return response.data;
    },
    update: async (id: number, data: { due_date?: string; notes?: string }) => {
        const response = await axiosInstance.put(`/api/v1/sales-invoices/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await axiosInstance.delete(`/api/v1/sales-invoices/${id}`);
        return response.data;
    },
    restore: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-invoices/${id}/restore`);
        return response.data;
    },
    getPendingPayments: async () => {
        const response = await axiosInstance.get("/api/v1/sales-invoices/pending-payments");
        return response.data;
    },
    payRemainder: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-invoices/${id}/pay-remainder`);
        return response.data;
    },
    payInstallment: async (id: number, amount: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-invoices/${id}/installment`, { amount });
        return response.data;
    },
    returnGallon: async (id: number) => {
        const response = await axiosInstance.post(`/api/v1/sales-invoices/${id}/return-gallon`);
        return response.data;
    },
    getLedgerReport: async (params: { customer_id: number; start_date?: string; end_date?: string }) => {
        const response = await axiosInstance.get("/api/v1/sales-invoices/ledger-report", { params });
        return response.data;
    },
    downloadPdf: async (id: number) => {
        const response = await axiosInstance.get(`/api/v1/sales-invoices/${id}/print`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
