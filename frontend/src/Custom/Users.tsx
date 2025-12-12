import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  TextField,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { MdDeleteOutline, MdEmail, MdAdd, MdMoreVert, MdAssignment } from "react-icons/md";
import { FaUserPlus, FaPause, FaPlay } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsers, userDeleteApi, userUpdateApi } from "../Hooks/user";
import CustomSnackBar from "./CustomSnackBar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { primaryButtonStyle, cancelButtonStyle, submitButtonStyle, dangerButtonStyle } from "../assets/Styles/ButtonStyles";

// Add Student Modal Component
const AddStudentModal = ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("skToken");

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; mobile: string }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Student created successfully!");
      setFormData({ name: "", email: "", mobile: "" });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to create student");
    },
    onSettled: () => setLoading(false),
  });

  const handleSubmit = () => {
    if (!formData.name || formData.name.length < 3) {
      CustomSnackBar.errorSnackbar("Name must be at least 3 characters");
      return;
    }
    if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      CustomSnackBar.errorSnackbar("Invalid email address");
      return;
    }
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      CustomSnackBar.errorSnackbar("Mobile must be exactly 10 digits");
      return;
    }
    setLoading(true);
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Add New Student</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Mobile (10 digits)"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            fullWidth
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ ...submitButtonStyle }}
        >
          {loading ? "Creating..." : "Create Student"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Assignment Modal Component
const AssignmentModal = ({ open, onClose, student }: { open: boolean; onClose: () => void; student: any }) => {
  const [itemType, setItemType] = useState<"course" | "internship" | "project">("course");
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("skToken");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && itemType) {
      fetchItems();
    }
  }, [open, itemType]);

  const fetchItems = async () => {
    try {
      let endpoint = "";
      switch (itemType) {
        case "course":
          endpoint = "/api/courses";
          break;
        case "internship":
          endpoint = "/admin/internships";
          break;
        case "project":
          endpoint = "/admin/projects";
          break;
      }
      const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const assignMutation = useMutation({
    mutationFn: async (data: { studentId: string; itemType: string; itemId: string }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/assignments`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Assignment successful!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedItem("");
      onClose();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to assign");
    },
    onSettled: () => setLoading(false),
  });

  const handleAssign = () => {
    if (!selectedItem) {
      CustomSnackBar.errorSnackbar("Please select an item to assign");
      return;
    }
    setLoading(true);
    assignMutation.mutate({
      studentId: student?._id || student?.id,
      itemType,
      itemId: selectedItem,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Assign to {student?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {["course", "internship", "project"].map((type) => (
              <Button
                key={type}
                variant={itemType === type ? "contained" : "outlined"}
                onClick={() => { setItemType(type as any); setSelectedItem(""); }}
                sx={{ textTransform: "capitalize", flex: 1 }}
                size="small"
              >
                {type}
              </Button>
            ))}
          </Box>
          <TextField
            select
            label={`Select ${itemType}`}
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            fullWidth
            size="small"
          >
            {items.map((item: any) => (
              <MenuItem key={item._id} value={item._id}>
                {item.name || item.title}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ ...cancelButtonStyle }}>Cancel</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || !selectedItem}
          sx={{ ...submitButtonStyle }}
        >
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Users = () => {
  const { data: getUsersResponse, isLoading, error, refetch } = useGetUsers();
  const { mutate: userStatusUpdate } = userUpdateApi();
  const { mutate: userDelete } = userDeleteApi();
  const [rows, setRows] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<any>(null);
  const token = Cookies.get("skToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (getUsersResponse) {
      setRows(getUsersResponse);
    }
  }, [getUsersResponse]);

  const sendInviteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Invite sent successfully!");
      refetch();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to send invite");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/suspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Student suspended!");
      refetch();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to suspend");
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}admin/students/${studentId}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      CustomSnackBar.successSnackbar("Student activated!");
      refetch();
    },
    onError: (error: any) => {
      CustomSnackBar.errorSnackbar(error.response?.data?.message || "Failed to activate");
    },
  });

  const handleAction = (id: string) => {
    if (id) {
      setUserToDelete(id);
      setDeleteModalOpen(true);
    } else {
      CustomSnackBar.errorSnackbar("Something Went Wrong!");
    }
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      userDelete(userToDelete, {
        onSuccess: () => {
          CustomSnackBar.successSnackbar("Deleted Successfully!");
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
        onError: () => {
          CustomSnackBar.errorSnackbar("Failed to delete user!");
          setDeleteModalOpen(false);
          setUserToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleSendInvite = () => {
    if (menuRow) {
      sendInviteMutation.mutate(menuRow._id || menuRow.id);
    }
    handleMenuClose();
  };

  const handleSuspend = () => {
    if (menuRow) {
      suspendMutation.mutate(menuRow._id || menuRow.id);
    }
    handleMenuClose();
  };

  const handleActivate = () => {
    if (menuRow) {
      activateMutation.mutate(menuRow._id || menuRow.id);
    }
    handleMenuClose();
  };

  const handleAssign = () => {
    setSelectedStudent(menuRow);
    setAssignModalOpen(true);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Self-Signed":
        return "info";
      case "Invited":
        return "warning";
      case "Created":
        return "default";
      case "Suspended":
        return "error";
      case "Deleted":
        return "error";
      default:
        return "default";
    }
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "secondary" : "primary";
  };

  const columns: GridColDef[] = [
    {
      field: "sno",
      headerName: "S.No",
      width: 70,
      renderCell: (params) => {
        const rowIndex = rows.findIndex(
          (row: any) => (row._id || row.id) === (params.row._id || params.row.id)
        );
        return rowIndex + 1;
      },
    },
    { field: "name", headerName: "Name", width: 140 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "mobile", headerName: "Mobile", width: 120 },
    {
      field: "role",
      headerName: "Role",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.role || "user"}
          size="small"
          color={getRoleColor(params.row.role)}
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.status || "Active"}
          size="small"
          color={getStatusColor(params.row.status)}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="More Actions">
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, params.row)}
            >
              <MdMoreVert />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleAction(params.row._id || params.row.id)}
              sx={{ color: "var(--red)" }}
            >
              <MdDeleteOutline />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <div className="Submitted_form_table">
        <Box sx={{ padding: 2, textAlign: "center", color: "var(--red)" }}>
          Error loading users: {error.message || "Something went wrong"}
        </Box>
      </div>
    );
  }

  return (
    <>
      <div className="Submitted_form_table">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            justifyContent: "space-between",
            marginBottom: "15px",
            "@media (max-width:600px)": {
              flexDirection: "column",
              alignItems: "start",
            },
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<FaUserPlus />}
            onClick={() => setAddModalOpen(true)}
            sx={{
              ...primaryButtonStyle,
              borderRadius: 2,
              padding: "6px 14px",
            }}
          >
            Add Student
          </Button>
        </Box>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick={false}
          onRowClick={(params) => {
            if (params.row.role === "student") {
              navigate(`/student/${params.row._id}`);
            }
          }}
          className="table_border"
          autoHeight
          getRowId={(row) => row._id || row.id}
        />
      </div>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ "& .MuiPaper-root": { borderRadius: 2, minWidth: 180 } }}
      >
        {menuRow?.role === "student" && menuRow?.status === "Created" && (
          <MenuItem onClick={handleSendInvite}>
            <MdEmail style={{ marginRight: 8 }} /> Send Invite
          </MenuItem>
        )}
        {menuRow?.role === "student" && menuRow?.status === "Invited" && (
          <MenuItem onClick={handleSendInvite}>
            <MdEmail style={{ marginRight: 8 }} /> Resend Invite
          </MenuItem>
        )}
        {menuRow?.role === "student" && (
          <MenuItem onClick={handleAssign}>
            <MdAssignment style={{ marginRight: 8 }} /> Assign Items
          </MenuItem>
        )}
        {menuRow?.status !== "Suspended" && menuRow?.status !== "Deleted" && (
          <MenuItem onClick={handleSuspend} sx={{ color: "error.main" }}>
            <FaPause style={{ marginRight: 8 }} /> Suspend
          </MenuItem>
        )}
        {menuRow?.status === "Suspended" && (
          <MenuItem onClick={handleActivate} sx={{ color: "success.main" }}>
            <FaPlay style={{ marginRight: 8 }} /> Activate
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "12px",
            padding: "0",
            margin: "16px",
            maxWidth: "380px",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", color: "var(--red)", fontWeight: "600" }}>
          Delete User
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#666" }}>
            Are you sure you want to delete this user?
          </Typography>
          <Typography sx={{ color: "#999", fontSize: "0.875rem", mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" sx={{ ...cancelButtonStyle }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ ...dangerButtonStyle }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Modal */}
      <AddStudentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        student={selectedStudent}
      />
    </>
  );
};

export default Users;
