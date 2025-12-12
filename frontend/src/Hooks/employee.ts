import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const getAuthHeader = () => {
    const token = Cookies.get("skToken");
    return { headers: { Authorization: `Bearer ${token}` } };
};

// --- Employee Hooks ---

export const useGetEmployees = () => {
    return useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}admin/employees`, getAuthHeader());
            return response.data;
        },
    });
};

export const useGetEmployeeById = (id: string) => {
    return useQuery({
        queryKey: ["employee", id],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}admin/employees/${id}`, getAuthHeader());
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`${BASE_URL}admin/employees`, data, getAuthHeader());
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
};

export const useUpdateEmployeeProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await axios.put(`${BASE_URL}admin/employees/${id}`, data, getAuthHeader());
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
        },
    });
};

export const useUpdateSalaryStructure = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await axios.post(`${BASE_URL}admin/employees/${id}/salary`, data, getAuthHeader());
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
        },
    });
};

// --- Payroll Hooks ---

export const useGeneratePayslip = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post(`${BASE_URL}admin/payroll/generate`, data, getAuthHeader());
            return response.data;
        },
    });
};

export const useGetPayslipHistory = (month?: string, year?: string, employeeId?: string) => {
    return useQuery({
        queryKey: ["payslips", month, year, employeeId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (month) params.append("month", month);
            if (year) params.append("year", year);
            if (employeeId) params.append("employeeId", employeeId);

            const response = await axios.get(`${BASE_URL}admin/payroll/history?${params.toString()}`, getAuthHeader());
            return response.data;
        },
    });
};

export const useSendPayslipEmail = () => {
    return useMutation({
        mutationFn: async (data: { payslipId: string; type: string }) => {
            const response = await axios.post(`${BASE_URL}admin/payroll/send-email`, data, getAuthHeader());
            return response.data;
        },
    });
};

export const useGetPayrollSettings = () => {
    return useQuery({
        queryKey: ["payrollSettings"],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}admin/payroll/settings`, getAuthHeader());
            return response.data;
        },
    });
};

export const useUpdatePayrollSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.put(`${BASE_URL}admin/payroll/settings`, data, getAuthHeader());
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payrollSettings"] });
        },
    });
};

// --- Employee Portal Hooks ---

export const useGetMyPayslips = () => {
    return useQuery({
        queryKey: ["myPayslips"],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}employee/payslips`, getAuthHeader());
            return response.data;
        },
    });
};
