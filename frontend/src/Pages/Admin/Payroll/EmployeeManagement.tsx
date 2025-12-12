import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Tooltip,
    MenuItem,
    Chip
} from "@mui/material";
import { MdEdit, MdAttachMoney, MdHistory } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployees, useCreateEmployee, useUpdateEmployeeProfile } from "../../../Hooks/employee";
import CustomSnackBar from "../../../Custom/CustomSnackBar";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle } from "../../../assets/Styles/ButtonStyles";

const AddEmployeeModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [formData, setFormData] = useState({
        name: "", email: "", mobile: "",
        designation: "", department: "", employeeId: "",
        joiningDate: "", gender: "Male"
    });

    const createMutation = useCreateEmployee();

    const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.employeeId || !formData.designation || !formData.department) {
            CustomSnackBar.errorSnackbar("Please fill all required fields (Name, Email, Employee ID, Designation, Department)");
            return;
        }
        createMutation.mutate(formData, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Employee created successfully");
                setFormData({ name: "", email: "", mobile: "", designation: "", department: "", employeeId: "", joiningDate: "", gender: "Male" });
                onClose();
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to create");
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>Add New Employee</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Full Name" fullWidth size="small" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <TextField label="Employee ID" fullWidth size="small" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Email" fullWidth size="small" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <TextField label="Mobile" fullWidth size="small" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Designation" fullWidth size="small" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                        <TextField label="Department" fullWidth size="small" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Joining Date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                        <TextField select label="Gender" fullWidth size="small" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending} sx={{ ...submitButtonStyle }}>
                    {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const EditEmployeeModal = ({ open, onClose, employeeData }: { open: boolean; onClose: () => void; employeeData: any }) => {
    const [formData, setFormData] = useState({
        name: employeeData?.user?.name || "",
        mobile: employeeData?.user?.mobile || "",
        designation: employeeData?.designation || "",
        department: employeeData?.department || "",
        joiningDate: employeeData?.joiningDate ? new Date(employeeData.joiningDate).toISOString().split('T')[0] : "",
        address: employeeData?.address || "",
        gender: employeeData?.gender || "Male"
    });

    const updateMutation = useUpdateEmployeeProfile();

    const handleSubmit = () => {
        if (!formData.name) {
            CustomSnackBar.errorSnackbar("Please fill required fields");
            return;
        }
        updateMutation.mutate({ id: employeeData._id, data: formData }, {
            onSuccess: () => {
                CustomSnackBar.successSnackbar("Employee updated successfully");
                onClose();
            },
            onError: (err: any) => {
                CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to update");
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 600 }}>Edit Employee</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Full Name" fullWidth size="small" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <TextField label="Mobile" fullWidth size="small" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Designation" fullWidth size="small" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                        <TextField label="Department" fullWidth size="small" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Joining Date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                        <TextField select label="Gender" fullWidth size="small" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                    </Box>
                    <TextField label="Address" fullWidth size="small" multiline rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={updateMutation.isPending} sx={{ ...submitButtonStyle }}>
                    {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const EmployeeManagement = () => {
    const { data: employees, isLoading, error } = useGetEmployees();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const navigate = useNavigate();

    const handleEditClick = (employee: any) => {
        setSelectedEmployee(employee);
        setEditModalOpen(true);
    };

    const columns: GridColDef[] = [
        { field: "employeeId", headerName: "ID", width: 100, valueGetter: (value, row) => row?.employeeId || "-" },
        { field: "name", headerName: "Name", width: 180, valueGetter: (value, row) => row?.user?.name || "-" },
        { field: "designation", headerName: "Designation", width: 150 },
        { field: "department", headerName: "Department", width: 150 },
        { field: "email", headerName: "Email", width: 200, valueGetter: (value, row) => row?.user?.email || "-" },
        {
            field: "status", headerName: "Status", width: 120, renderCell: (params: any) => (
                <Chip label={params.row.user?.status || "Active"} color={params.row.user?.status === "Active" ? "success" : "default"} size="small" />
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params: any) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Edit Profile">
                        <IconButton size="small" onClick={() => handleEditClick(params.row)}><MdEdit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Salary">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/payroll/salary/${params.row._id}`)}>
                            <MdAttachMoney />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Payslip History">
                        <IconButton size="small" color="secondary" onClick={() => navigate(`/payroll/history?employeeId=${params.row._id}`)}>
                            <MdHistory />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    if (error) return <Box p={3}>Error loading employees</Box>;

    return (
        <div className="Submitted_form_table">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Employee Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<FaUserPlus />}
                    onClick={() => setAddModalOpen(true)}
                    sx={{ ...primaryButtonStyle }}
                >
                    Add Employee
                </Button>
            </Box>

            <DataGrid
                rows={employees || []}
                columns={columns}
                loading={isLoading}
                autoHeight
                getRowId={(row) => row._id}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 20]}
                sx={{ bgcolor: "white" }}
            />

            <AddEmployeeModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
            <EditEmployeeModal open={editModalOpen} onClose={() => setEditModalOpen(false)} employeeData={selectedEmployee} />
        </div>
    );
};

export default EmployeeManagement;
