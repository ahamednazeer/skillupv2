import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const getAuthHeader = () => {
    const token = Cookies.get("skToken");
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const useGetPaymentSettings = () => {
    return useQuery({
        queryKey: ["paymentSettings"],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}payment/settings`);
            return response.data;
        },
    });
};

export const useGetPaymentSettingsAdmin = () => {
    return useQuery({
        queryKey: ["adminPaymentSettings"],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}admin/payment/settings`, getAuthHeader());
            return response.data;
        },
    });
};

export const useUpdatePaymentSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.put(`${BASE_URL}admin/payment/settings`, data, getAuthHeader());
            return response.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPaymentSettings"] }),
    });
};

export const useUploadPaymentQR = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await axios.post(`${BASE_URL}admin/payment/settings/upload-qr`, formData, { headers: { Authorization: `Bearer ${Cookies.get("skToken")}`, "Content-Type": "multipart/form-data" } });
            return response.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPaymentSettings"] })
    })
};
