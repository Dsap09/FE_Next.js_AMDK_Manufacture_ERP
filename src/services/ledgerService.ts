import axiosInstance from "@/lib/axios";

export const ledgerService = {
    getSummary: async (params?: {
        type?: string;
        category?: string;
        account_id?: string;
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await axiosInstance.get("/api/v1/ledger/summary", { params });
        return response.data;
    },

    getDetail: async (accountId: number | string, params?: {
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await axiosInstance.get(`/api/v1/ledger/detail/${accountId}`, { params });
        return response.data;
    },

    getTrialBalance: async (params?: {
        start_date?: string;
        end_date?: string;
    }) => {
        const response = await axiosInstance.get("/api/v1/ledger/trial-balance", { params });
        return response.data;
    },
};
