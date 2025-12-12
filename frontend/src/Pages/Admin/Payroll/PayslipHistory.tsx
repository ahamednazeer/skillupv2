import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Button, IconButton, TextField, MenuItem } from "@mui/material";
import { MdDownload, MdEmail } from "react-icons/md";
import { useGetPayslipHistory, useSendPayslipEmail } from "../../../Hooks/employee";
import { useState } from "react";
import CustomSnackBar from "../../../Custom/CustomSnackBar";
import Cookies from "js-cookie";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const PayslipHistory = () => {
    const [filter, setFilter] = useState({ month: "", year: "" });
    const { data: payslips, isLoading, refetch } = useGetPayslipHistory(filter.month, filter.year);
    const sendEmailMutation = useSendPayslipEmail();
    const [downloading, setDownloading] = useState(false);

    const handleSendEmail = (id: string, type: "ATTACHMENT" | "LINK") => {
        sendEmailMutation.mutate({ payslipId: id, type }, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Email Sent Successfully");
                refetch();
            },
            onError: () => CustomSnackBar.errorSnackbar("Failed to send email")
        });
    };

    const handleDownload = async (payslipId: string) => {
        try {
            setDownloading(true);
            const token = Cookies.get("skToken");
            const downloadUrl = `${BASE_URL}admin/payroll/download/${payslipId}`;
            
            console.log("Preview URL:", downloadUrl);
            console.log("Token:", token ? "Present" : "Missing");
            
            // Open PDF in new tab for preview
            const newWindow = window.open();
            if (newWindow) {
                const response = await axios.get(downloadUrl, {
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/pdf"
                    },
                    responseType: 'blob'
                });
                
                // Create blob URL and open in new tab
                const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                newWindow.location.href = blobUrl;
            }
            
            CustomSnackBar.successSnackbar("Opening PDF preview...");
        } catch (error: any) {
            console.error("Preview error:", error);
            console.error("Error response:", error.response?.data);
            CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to preview payslip");
        } finally {
            setDownloading(false);
        }
    };

    const columns: GridColDef[] = [
        { field: "employeeName", headerName: "Employee", width: 180, valueGetter: (value, row) => row.employee?.user?.name || "-" },
        { field: "month", headerName: "Month", width: 120 },
        { field: "year", headerName: "Year", width: 100 },
        { field: "netPay", headerName: "Net Pay", width: 120 },
        { field: "status", headerName: "Status", width: 120 },
        { field: "emailSent", headerName: "Emailed", width: 100, type: 'boolean' },
        {
            field: "actions",
            headerName: "Actions",
            width: 250,
            renderCell: (params: any) => (
                <Box display="flex" gap={1}>
                    <IconButton size="small" onClick={() => handleDownload(params.row._id)} disabled={downloading}>
                        <MdDownload />
                    </IconButton>
                    <Button size="small" startIcon={<MdEmail />} onClick={() => handleSendEmail(params.row._id, "ATTACHMENT")}>
                        Email PDF
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <div className="Submitted_form_table">
            <Typography variant="h6" fontWeight="bold" mb={2}>Payslip History</Typography>

            <Box display="flex" gap={2} mb={2}>
                <TextField select label="Month" size="small" value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })} sx={{ width: 150 }}>
                    <MenuItem value="">All</MenuItem>
                    {["January", "February", "March", "April", "May", "June", "July"].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </TextField>
                <TextField label="Year" size="small" value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })} />
            </Box>

            <DataGrid
                rows={payslips || []}
                columns={columns}
                loading={isLoading}
                autoHeight
                getRowId={(row) => row._id}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 20]}
                sx={{ bgcolor: "white" }}
            />
        </div>
    );
};

export default PayslipHistory;
