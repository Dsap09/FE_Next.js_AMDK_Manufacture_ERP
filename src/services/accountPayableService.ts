import axiosInstance from "@/lib/axios";

export const accountPayableService = {
    getAll: async (params?: {
        status?: string;
        overdue?: string;
        supplier_id?: string;
        due_from?: string;
        due_to?: string;
    }) => {
        const response = await axiosInstance.get("/api/v1/account-payables", { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/account-payables/${id}`);
        return response.data;
    },

    getAgingReport: async () => {
        const response = await axiosInstance.get("/api/v1/account-payables/aging-report");
        return response.data;
    },

    getSummaryBySupplier: async () => {
        const response = await axiosInstance.get("/api/v1/account-payables/summary-by-supplier");
        return response.data;
    },

    createFromInvoiceReceipt: async (data: {
        invoice_receipt_id: number;
        payable_account_id: number;
        inventory_account_id: number;
        notes?: string;
    }) => {
        const response = await axiosInstance.post("/api/v1/account-payables/from-invoice-receipt", data);
        return response.data;
    },
};
