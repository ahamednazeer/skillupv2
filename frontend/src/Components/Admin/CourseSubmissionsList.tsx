import { useState, useRef } from "react";
import {
    Box,
    Typography,
    Card,
    Chip,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Tooltip,
    MenuItem
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
    MdSchool,
    MdUpload,
    MdCheckCircle,
    MdPerson,
    MdAssignment,
    MdAttachMoney,
    MdPayment,
    MdDownload,
    MdDelete
} from "react-icons/md";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/Images/blacklogo.png";
import background from "../../assets/Images/background.png";
import msme from "../../assets/Images/msms.png";
import iso from "../../assets/Images/isonew.png";
import iaf from "../../assets/Images/iaf.png";
import sign from "../../assets/Images/dummysign.png";

const CourseSubmissionsList = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    // Modals state
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [viewFilesModal, setViewFilesModal] = useState(false);
    // Certificate Generation
    const [certificateModal, setCertificateModal] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [generating, setGenerating] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    // Payment State
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState<{ amount: string | number; notes: string }>({ amount: "", notes: "" });
    const [generatingInvoice, setGeneratingInvoice] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Upload Form State
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    const handleGenerateCertificate = async () => {
        if (!certificateRef.current || !selectedAssignment) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(certificateRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("l", "mm", "a4");
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, "PNG", 0, 0, width, height);

            // Convert PDF to Blob
            const pdfBlob = pdf.output("blob");
            const formData = new FormData();
            formData.append("certificate", pdfBlob, `${selectedAssignment.student.name}_Certificate.pdf`);

            // Upload & Complete
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/complete`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );

            CustomSnackBar.successSnackbar("Certificate issued & Course Completed!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setCertificateModal(false);
        } catch (err: any) {
            console.error("Certificate Error:", err);
            CustomSnackBar.errorSnackbar("Failed to generate certificate");
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateInvoice = async (item: any) => {
        if (!invoiceRef.current) return;
        setSelectedAssignment(item); // Ensure correct item is waiting
        setGeneratingInvoice(true);
        // Small delay to allow state update if needed, though mostly synchronous here
        setTimeout(async () => {
            try {
                if (!invoiceRef.current) return;
                const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const width = pdf.internal.pageSize.getWidth();
                const height = (canvas.height * width) / canvas.width;
                pdf.addImage(imgData, "PNG", 0, 0, width, height);
                pdf.save(`${item.student.name}_Invoice.pdf`);
                CustomSnackBar.successSnackbar("Invoice generated!");
            } catch (err) {
                console.error("Invoice Error:", err);
                CustomSnackBar.errorSnackbar("Failed to generate invoice");
            } finally {
                setGeneratingInvoice(false);
            }
        }, 500);
    };

    // Fetch assignments
    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ["course-assignments"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments?itemType=course`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    // Upload Files Mutation (Multiple)
    const uploadFilesMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const formData = new FormData();
            uploadFiles.forEach((file) => formData.append("files", file));
            formData.append("fileTypes", JSON.stringify(fileTypes));

            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${assignmentId}/upload-files`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Files uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setUploadModal(false);
            setUploadFiles([]);
            setFileTypes([]);
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload files");
        },
    });

    const completeMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            if (certificateFile) formData.append("certificate", certificateFile);

            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/complete`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Course completed and certificate issued");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setCertificateModal(false);
            setCertificateFile(null);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to complete course"),
    });

    const requestPaymentMutation = useMutation({
        mutationFn: async () => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${selectedAssignment._id}/request-payment`,
                paymentForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Payment requested!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
            setPaymentModal(false);
            setPaymentForm({ amount: 0, notes: "" });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to request payment"),
    });

    const markPaidMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}admin/course-assignments/${id}/mark-paid`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Marked as Paid!");
            queryClient.invalidateQueries({ queryKey: ["course-assignments"] });
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to mark paid"),
    });

    // Handlers
    const handleOpenUpload = (item: any) => { setSelectedAssignment(item); setUploadModal(true); setUploadFiles([]); setFileTypes([]); };
    const handleOpenViewFiles = (item: any) => { setSelectedAssignment(item); setViewFilesModal(true); };
    const handleOpenCertificate = (item: any) => { setSelectedAssignment(item); setCertificateModal(true); };
    const handleOpenPayment = (item: any) => {
        setSelectedAssignment(item);

        let initialAmount: string | number = "";
        if (item?.itemId) {
            const price = Number(item.itemId.price || item.itemId.prize || 0);
            const discount = Number(item.itemId.discount || 0);
            if (price > 0) {
                initialAmount = discount > 0 ? Math.round(price - (price * discount) / 100) : price;
            }
        }

        setPaymentForm({ amount: initialAmount, notes: "" });
        setPaymentModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setUploadFiles([...uploadFiles, ...newFiles]);
            setFileTypes([...fileTypes, ...newFiles.map(() => "other")]);
        }
    };

    const handleFileTypeChange = (index: number, type: string) => {
        const newTypes = [...fileTypes];
        newTypes[index] = type;
        setFileTypes(newTypes);
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = [...uploadFiles];
        const newTypes = [...fileTypes];
        newFiles.splice(index, 1);
        newTypes.splice(index, 1);
        setUploadFiles(newFiles);
        setFileTypes(newTypes);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "success";
            case "assigned": return "info";
            default: return "default";
        }
    };

    // Filter assignments based on tab
    const filteredAssignments = assignments?.filter((a: any) => {
        if (tabValue === 0) return a.status !== "completed"; // Active
        if (tabValue === 1) return a.status === "completed"; // Completed
        return true;
    }) || [];

    if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error loading data</Alert>;

    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tab label="Active Courses" />
                    <Tab label="Completed / Certified" />
                </Tabs>

                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Assigned At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAssignments.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center">No courses found</TableCell></TableRow>
                            ) : filteredAssignments.map((row: any) => (
                                <TableRow key={row._id}>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <MdPerson />
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">{row.student?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{row.student?.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{row.itemId?.name}</TableCell>
                                    <TableCell>
                                        <Chip label={row.status} size="small" color={getStatusColor(row.status) as any} />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {row.payment?.amount ? `₹${row.payment.amount}` : "N/A"}
                                            </Typography>
                                            <Chip
                                                label={row.payment?.status?.toUpperCase() || "NOT REQ"}
                                                size="small"
                                                color={row.payment?.status === "paid" ? "success" : row.payment?.status === "pending" ? "warning" : "default"}
                                                sx={{ height: 20, fontSize: "0.6rem", width: "fit-content" }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>{new Date(row.assignedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", maxWidth: 250 }}>
                                            {/* Payment Actions */}
                                            {(!row.payment?.required && row.status !== "completed" && row.status !== "delivered") && (
                                                <Tooltip title="Request Payment">
                                                    <IconButton size="small" color="warning" onClick={() => handleOpenPayment(row)}>
                                                        <MdAttachMoney />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {row.payment?.status === "pending" && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => markPaidMutation.mutate(row._id)}
                                                    disabled={markPaidMutation.isPending}
                                                    sx={{ fontSize: "0.7rem", py: 0.5 }}
                                                >
                                                    Mark Paid
                                                </Button>
                                            )}
                                            {row.payment?.status === "paid" && (
                                                <Tooltip title="Download Invoice">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleGenerateInvoice(row)}
                                                        disabled={generatingInvoice && selectedAssignment?._id === row._id}
                                                    >
                                                        {generatingInvoice && selectedAssignment?._id === row._id ? <CircularProgress size={20} /> : <MdPayment />}
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {/* Upload Assignment (Files) */}
                                            {row.status !== "completed" ? (
                                                <>
                                                    <Tooltip title="Upload Files">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenUpload(row)}>
                                                            <MdUpload />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Complete & Issue Certificate">
                                                        <IconButton size="small" color="success" onClick={() => handleOpenCertificate(row)}>
                                                            <MdSchool />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <IconButton size="small" color="success" disabled>
                                                    <MdCheckCircle />
                                                </IconButton>
                                            )}
                                            <Tooltip title="View Submissions">
                                                <IconButton size="small" onClick={() => handleOpenViewFiles(row)}>
                                                    <MdAssignment />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Upload Modal (Multi-file) */}
            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Course Files</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <Alert severity="info">Upload materials, resources, or files for the student.</Alert>

                        <Button variant="outlined" component="label" startIcon={<MdUpload />} fullWidth>
                            Select Files
                            <input type="file" hidden multiple onChange={handleFileChange} />
                        </Button>

                        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                            {uploadFiles.map((file, index) => (
                                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, p: 1, border: "1px solid #eee", borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</Typography>
                                    <TextField
                                        select
                                        size="small"
                                        value={fileTypes[index] || "other"}
                                        onChange={(e) => handleFileTypeChange(index, e.target.value)}
                                        sx={{ width: 120 }}
                                    >
                                        <MenuItem value="course-material">Course Material</MenuItem>
                                        <MenuItem value="assignment">Assignment</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </TextField>
                                    <IconButton size="small" onClick={() => handleRemoveFile(index)} color="error"><MdDelete /></IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadModal(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => uploadFilesMutation.mutate(selectedAssignment?._id)}
                        disabled={uploadFiles.length === 0 || uploadFilesMutation.isPending}
                    >
                        {uploadFilesMutation.isPending ? "Uploading..." : "Upload Files"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Files Modal */}
            <Dialog open={viewFilesModal} onClose={() => setViewFilesModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Files & Submissions</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }} fontWeight="bold">Course Files (Admin Uploads)</Typography>
                    {selectedAssignment?.deliveryFiles?.length > 0 ? (
                        <Box sx={{ maxHeight: 150, overflowY: "auto", mb: 2 }}>
                            {selectedAssignment.deliveryFiles.map((file: any, index: number) => (
                                <Box key={index} sx={{ p: 1, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Typography variant="body2">{file.fileName}</Typography>
                                        <Chip label={file.fileType} size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
                                    </Box>
                                    <Button size="small" href={file.filePath} target="_blank" startIcon={<MdDownload />}>Download</Button>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No admin files uploaded.</Typography>
                    )}

                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }} fontWeight="bold">Student Submissions</Typography>
                    {selectedAssignment?.courseSubmissions?.length > 0 ? (
                        <Box sx={{ maxHeight: 150, overflowY: "auto", mb: 2 }}>
                            {selectedAssignment.courseSubmissions.map((file: any, index: number) => (
                                <Box key={index} sx={{ p: 1, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Box>
                                        <Typography variant="body2">{file.fileName}</Typography>
                                        <Typography variant="caption" color="text.secondary">By: {file.uploadedByRole}</Typography>
                                    </Box>
                                    <Button size="small" href={file.filePath} target="_blank" startIcon={<MdDownload />}>Download</Button>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No submissions found.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewFilesModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Complete & Certificate Modal */}
            <Dialog open={certificateModal} onClose={() => setCertificateModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Complete Course & Issue Certificate</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <Alert severity="success">This will mark the course as Completed.</Alert>
                        <Typography variant="subtitle2">Upload Certificate (Optional but Recommended)</Typography>
                        <Button variant="outlined" component="label" startIcon={<MdUpload />}>
                            Select Certificate (PDF/Image)
                            <input type="file" hidden onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
                        </Button>
                        <Typography variant="caption" align="center">- OR -</Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleGenerateCertificate}
                            disabled={generating}
                        >
                            {generating ? "Generating..." : "Auto-Generate Certificate"}
                        </Button>
                        {certificateFile && <Typography variant="body2" color="success.main" fontWeight="bold">Ready: {certificateFile.name}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCertificateModal(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>Complete Course</Button>
                </DialogActions>
            </Dialog>

            {/* Payment Modal */}
            <Dialog open={paymentModal} onClose={() => setPaymentModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Request Payment</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            label="Amount (₹)"
                            type="number"
                            fullWidth
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        />
                        <TextField
                            label="Notes"
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mt: 2 }}
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={() => requestPaymentMutation.mutate()} disabled={requestPaymentMutation.isPending}>Request</Button>
                </DialogActions>
            </Dialog>

            {/* Hidden Invoice Template */}
            <Box sx={{ position: "absolute", left: "-3000px", top: 0 }}>
                <Paper
                    ref={invoiceRef}
                    elevation={0}
                    sx={{
                        width: "210mm", // A4 width
                        minHeight: "297mm",
                        padding: "40px",
                        backgroundColor: "#fff",
                        fontFamily: "'Roboto', sans-serif",
                        color: "#333",
                        boxSizing: "border-box"
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, borderBottom: "2px solid #eee", pb: 2 }}>
                        <Box>
                            <img src={logo} alt="Logo" style={{ height: "60px", marginBottom: "10px" }} />
                            <Typography variant="h6" fontWeight="bold" color="primary">Skill Up Tech Solutions</Typography>
                            <Typography variant="body2">Plot No. 10, 2nd Floor, Somewhere Street</Typography>
                            <Typography variant="body2">City, State - Zip Code</Typography>
                            <Typography variant="body2">Email: contact@skilluptech.com</Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                            <Typography variant="h3" fontWeight="bold" color="#ccc" sx={{ letterSpacing: 2 }}>INVOICE</Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>Order # {selectedAssignment?.payment?.transactionId || Date.now().toString().slice(-6)}</Typography>
                            <Typography variant="body2">Date: {new Date().toLocaleDateString()}</Typography>
                        </Box>
                    </Box>

                    {/* Bill To */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: "#555" }}>Bill To:</Typography>
                        <Typography variant="h6" fontWeight="bold">{selectedAssignment?.student?.name}</Typography>
                        <Typography variant="body2">{selectedAssignment?.student?.email}</Typography>
                    </Box>

                    {/* Table */}
                    <Box sx={{ width: "100%", mb: 4 }}>
                        <Box sx={{ display: "flex", bgcolor: "#f1f5f9", p: 1.5, borderRadius: 1 }}>
                            <Typography sx={{ flex: 3, fontWeight: "bold" }}>Description</Typography>
                            <Typography sx={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Qty</Typography>
                            <Typography sx={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>Price</Typography>
                            <Typography sx={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>Total</Typography>
                        </Box>
                        <Box sx={{ display: "flex", p: 1.5, borderBottom: "1px solid #eee" }}>
                            <Typography sx={{ flex: 3 }}>
                                Course Fee: <strong>{selectedAssignment?.itemId?.name}</strong>
                                {selectedAssignment?.payment?.notes && <span style={{ display: "block", fontSize: "0.8em", color: "#666" }}>{selectedAssignment.payment.notes}</span>}
                            </Typography>
                            <Typography sx={{ flex: 1, textAlign: "center" }}>1</Typography>
                            <Typography sx={{ flex: 1, textAlign: "right" }}>₹{selectedAssignment?.payment?.amount}</Typography>
                            <Typography sx={{ flex: 1, textAlign: "right" }}>₹{selectedAssignment?.payment?.amount}</Typography>
                        </Box>
                    </Box>

                    {/* Total */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 6 }}>
                        <Box sx={{ width: "250px" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography>Subtotal:</Typography>
                                <Typography>₹{selectedAssignment?.payment?.amount}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, fontWeight: "bold", fontSize: "1.2rem", borderTop: "2px solid #333", pt: 1 }}>
                                <Typography>Total:</Typography>
                                <Typography>₹{selectedAssignment?.payment?.amount}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ mt: "auto", pt: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Thank you for your business!</Typography>
                            <Typography variant="caption" color="text.secondary">If you have any questions, please contact support.</Typography>
                        </Box>
                        <div style={{ textAlign: "center" }}>
                            <img src={sign} alt="Sign" style={{ width: "100px" }} />
                            <Typography variant="body2" fontWeight="bold">Authorized Signature</Typography>
                        </div>
                    </Box>
                </Paper>
            </Box>

            {/* Hidden Certificate Template for Generation */}
            <Box sx={{ position: "absolute", left: "-3000px", top: 0 }}>
                <Box
                    ref={certificateRef}
                    sx={{
                        position: "relative",
                        width: "800px",
                        height: "530px",
                        margin: "auto",
                        overflow: "hidden",
                        fontFamily: "'Trykker', serif",
                        color: "#545151",
                        backgroundColor: "#fff",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Background */}
                    <img
                        src={background}
                        alt="Background"
                        width="100%"
                        height="100%"
                        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
                    />

                    {/* Certificate Content */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            width: "100%",
                            height: "100%",
                            textAlign: "center",
                            zIndex: 2,
                        }}
                    >
                        <img
                            src={logo}
                            alt="logo"
                            style={{ width: "100px", marginTop: "30px" }}
                        />

                        <h2 style={{ margin: 0, fontFamily: "Trykker", fontSize: "35px", color: "#545151" }}>
                            CERTIFICATE
                        </h2>

                        <h3 style={{ margin: 0, fontFamily: "Style Script", fontSize: "25px", color: "#545151" }}>
                            Of Completion
                        </h3>

                        <h4 style={{ marginTop: "30px", fontFamily: "Trykker", fontSize: "18px", color: "#545151" }}>
                            This Certificate is Proudly Presented to
                        </h4>

                        <h5 style={{ marginTop: "10px", fontFamily: "Style Script", fontSize: "35px", color: "#545151" }}>
                            {selectedAssignment?.student?.name || "Student Name"}
                        </h5>

                        <h6 style={{ margin: "10px auto 0 auto", fontFamily: "Trykker", fontSize: "16px", color: "#545151", maxWidth: "85%", lineHeight: "1.5" }}>
                            Has successfully completed the course <strong>{selectedAssignment?.itemId?.name}</strong> at Skill Up Tech Solution.
                        </h6>

                        {/* Bottom Section */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0px 40px", position: "absolute", bottom: "60px", width: "100%" }}>
                            <img src={iaf} alt="IAF" style={{ width: "100px" }} />
                            <img src={msme} alt="MSME" style={{ width: "100px" }} />
                            <img src={iso} alt="ISO" style={{ width: "100px" }} />

                            <div style={{ textAlign: "center" }}>
                                <img src={sign} alt="Sign" style={{ width: "100px" }} />
                                <h3 style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Nivetha</h3>
                                <p style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Co-ordinator</p>
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <img src={sign} alt="Sign" style={{ width: "100px" }} />
                                <h3 style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Mohamed Faroon</h3>
                                <p style={{ margin: 0, fontFamily: "Trykker", fontSize: "16px", color: "#545151" }}>Head Manager</p>
                            </div>
                        </div>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CourseSubmissionsList;
