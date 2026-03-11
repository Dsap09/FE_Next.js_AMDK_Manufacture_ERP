import axiosInstance from "@/lib/axios";

export const payablePaymentService = {
    getAll: async (params?: {
        status?: string;
        supplier_id?: string;
        payment_method?: string;
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await axiosInstance.get("/api/v1/payable-payments", { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/payable-payments/${id}`);
        return response.data;
    },

    create: async (data: {
        account_payable_id: number;
        payment_method: string;
        payment_account_id: number;
        payment_date: string;
        amount: number;
        reference_number?: string;
        bank_name?: string;
        account_number?: string;
        notes?: string;
    }) => {
        const response = await axiosInstance.post("/api/v1/payable-payments", data);
        return response.data;
    },

    update: async (id: number | string, data: {
        payment_method: string;
        payment_account_id: number;
        payment_date: string;
        amount: number;
        reference_number?: string;
        bank_name?: string;
        account_number?: string;
        notes?: string;
    }) => {
        const response = await axiosInstance.put(`/api/v1/payable-payments/${id}`, data);
        return response.data;
    },

    confirm: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/payable-payments/${id}/confirm`);
        return response.data;
    },

    cancel: async (id: number | string) => {
        const response = await axiosInstance.post(`/api/v1/payable-payments/${id}/cancel`);
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await axiosInstance.delete(`/api/v1/payable-payments/${id}`);
        return response.data;
    },

    print: async (id: number | string) => {
        const response = await axiosInstance.get(`/api/v1/payable-payments/${id}/print`);
        return response.data;
    },

    getPrintUrl: (id: number | string) => {
        return `/print/payment/${id}`;
    },
};
