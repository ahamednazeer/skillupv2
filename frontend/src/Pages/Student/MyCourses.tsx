import { useState, useRef } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    TextField,
    IconButton,
    Grid
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useGetPaymentSettings } from "../../Hooks/payment";
import { MdDownload, MdUpload, MdDescription, MdDateRange, MdPerson, MdAttachFile, MdPayment, MdCheck, MdAccessTime } from "react-icons/md";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../../assets/Images/blacklogo.png";
import sign from "../../assets/Images/dummysign.png";
import { submitButtonStyle } from "../../assets/Styles/ButtonStyles";
import config from "../../Config/Config";

const MyCourses = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();

    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [detailsModal, setDetailsModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [notes, setNotes] = useState("");
    const [generatingInvoice, setGeneratingInvoice] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["my-courses"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-courses`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    const { data: paymentSettings } = useGetPaymentSettings();

    const uploadMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            if (uploadFile) formData.append("file", uploadFile);
            formData.append("notes", notes);

            await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/courses/${selectedCourse._id}/upload-assignment`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Assignment uploaded successfully");
            queryClient.invalidateQueries({ queryKey: ["my-courses"] });
            setUploadModal(false);
            setUploadFile(null);
            setNotes("");
            // Refresh selected course data
            const updated = data.find((c: any) => c._id === selectedCourse._id);
            if (updated) setSelectedCourse(updated);
        },
        onError: (err: any) => CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload"),
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "success";
            case "in-progress": return "primary";
            default: return "default";
        }
    };

    // Calculate progress based on start and end dates
    const calculateProgress = (startDate: string | undefined, endDate: string | undefined, status: string): number => {
        // If course is completed, return 100%
        if (status === "completed") return 100;

        // If no dates provided, return 0
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();

        // If course hasn't started yet
        if (now < start) return 0;

        // If course has ended
        if (now >= end) return 100;

        // Calculate progress as percentage between start and end dates
        const totalDuration = end - start;
        const elapsedDuration = now - start;
        const progress = Math.round((elapsedDuration / totalDuration) * 100);

        return Math.min(progress, 99); // Cap at 99% until marked as completed
    };

    const handleViewDetails = (course: any) => {
        setSelectedCourse(course);
        setDetailsModal(true);
    };

    const handleDownload = (path: string, filename: string) => {
        const link = document.createElement("a");
        if (path.startsWith("http")) {
            link.href = path;
        } else {
            link.href = `${import.meta.env.VITE_APP_BASE_URL}/${path}`;
        }
        link.setAttribute("download", filename);
        link.target = "_blank"; // Open in new tab if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadInvoice = async () => {
        if (!invoiceRef.current) return;
        setGeneratingInvoice(true);
        try {
            const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`${selectedCourse.itemId.name}_Invoice.pdf`);
            CustomSnackBar.successSnackbar("Invoice downloaded!");
        } catch (err) {
            console.error("Invoice Error:", err);
            CustomSnackBar.errorSnackbar("Failed to download invoice");
        } finally {
            setGeneratingInvoice(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">Failed to load courses.</Alert>;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                📚 My Courses
            </Typography>

            {!data || data.length === 0 ? (
                <Alert severity="info">No courses assigned yet. Contact admin to get started!</Alert>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {data.map((assignment: any) => {
                        const course = assignment.itemId;
                        const isCompleted = assignment.status === "completed";
                        const paymentPending = assignment.payment?.status === "pending";
                        const courseProgress = calculateProgress(course?.startDate, course?.endDate, assignment.status);

                        return (
                            <Card key={assignment._id} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden", transition: "all 0.3s ease", "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.05)" } }}>
                                <CardContent sx={{ p: 0 }}>
                                    <Grid container spacing={0}>
                                        {/* Image Section - Left (or Top on Mobile) */}
                                        <Grid xs={12} sm={4} md={3}>
                                            <Box
                                                component="img"
                                                src={course?.fileupload ? `${config.BASE_URL_MAIN}/uploads/${course.fileupload}` : "https://via.placeholder.com/300?text=Course"}
                                                alt={course?.name}
                                                sx={{
                                                    width: "100%",
                                                    height: { xs: 160, sm: 200, md: 220 },
                                                    objectFit: "cover",
                                                    borderTopLeftRadius: { xs: 12, sm: 12 },
                                                    borderTopRightRadius: { xs: 12, sm: 0 },
                                                    borderBottomLeftRadius: { xs: 0, sm: 12 },
                                                }}
                                            />
                                        </Grid>

                                        {/* Content Section */}
                                        <Grid xs={12} sm={8} md={9} sx={{ p: { xs: 2, sm: 3, md: 3 }, display: "flex", flexDirection: "column" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 1, mb: 1 }}>
                                                <Box>
                                                    <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1.2 }}>{course?.name || "Untitled Course"}</Typography>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, color: "text.secondary", flexWrap: "wrap" }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <MdPerson />
                                                            <Typography variant="caption">{course?.trainer || "TBA"}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <MdAccessTime />
                                                            <Typography variant="caption">{course?.duration || "Flexible"}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <MdDateRange />
                                                            <Typography variant="caption">
                                                                {course?.startDate ? new Date(course.startDate).toLocaleDateString() : "Date TBA"}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    icon={isCompleted ? <MdCheck /> : <MdAccessTime />}
                                                    label={isCompleted ? "Completed" : "In Progress"}
                                                    color={getStatusColor(assignment.status) as any}
                                                    size="small"
                                                    sx={{ textTransform: "uppercase", fontWeight: "bold", fontSize: "0.7rem", height: 24 }}
                                                />
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {course?.description || "No description available."}
                                            </Typography>

                                            {/* Progress Section */}
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                                    <Typography variant="caption" fontWeight="600" color="text.secondary">Course Progress</Typography>
                                                    <Typography variant="caption" fontWeight="bold">{courseProgress}%</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={courseProgress}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: "#f1f5f9",
                                                        "& .MuiLinearProgress-bar": {
                                                            borderRadius: 4,
                                                            background: isCompleted ? "#22c55e" : "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Alerts Area */}
                                            {paymentPending && (
                                                <Alert severity="warning" icon={<MdPayment fontSize="inherit" />} sx={{ mb: 2, py: 0, alignItems: "center" }}>
                                                    <Typography variant="caption">Payment of <strong>₹{assignment.payment.amount}</strong> is pending.</Typography>
                                                </Alert>
                                            )}

                                            <Divider sx={{ mb: 2 }} />

                                            {/* Action Buttons */}
                                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: "auto" }}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleViewDetails(assignment)}
                                                    sx={{ ...submitButtonStyle, py: 0.8 }}
                                                >
                                                    View Details
                                                </Button>

                                                {isCompleted && assignment.certificate?.url && (
                                                    <Button
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<MdDownload />}
                                                        onClick={() => handleDownload(assignment.certificate.url, "Certificate.pdf")}
                                                        sx={{ py: 0.8 }}
                                                    >
                                                        Download Certificate
                                                    </Button>
                                                )}

                                                {!isCompleted && !paymentPending && (
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<MdUpload />}
                                                        onClick={() => { setSelectedCourse(assignment); setUploadModal(true); }}
                                                        sx={{ py: 0.8 }}
                                                    >
                                                        Upload Assignment
                                                    </Button>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* Course Details Modal */}
            <Dialog open={detailsModal} onClose={() => setDetailsModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight="bold">Course Details</Typography>
                        <IconButton onClick={() => setDetailsModal(false)} size="small">✕</IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCourse && (
                        <Grid container spacing={4}>
                            {/* Left Column: Info */}
                            <Grid xs={12} md={7}>
                                <Typography variant="h5" fontWeight="700" color="primary" gutterBottom>
                                    {selectedCourse.itemId?.name}
                                </Typography>

                                {/* Meta Info Grid */}
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Trainer</Typography>
                                        <Typography variant="body2" fontWeight="500">{selectedCourse.itemId?.trainer || "N/A"}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                                        <Typography variant="body2" fontWeight="500">{selectedCourse.itemId?.duration || "N/A"}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Start Date</Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {selectedCourse.itemId?.startDate ? new Date(selectedCourse.itemId.startDate).toLocaleDateString() : "TBA"}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">End Date</Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {selectedCourse.itemId?.endDate ? new Date(selectedCourse.itemId.endDate).toLocaleDateString() : "TBA"}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Description</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {selectedCourse.itemId?.description}
                                </Typography>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Resources & Files</Typography>
                                {((selectedCourse.itemId?.attachments?.length || 0) + (selectedCourse.deliveryFiles?.length || 0)) === 0 && (
                                    <Typography variant="caption" color="text.secondary">No resources available.</Typography>
                                )}

                                <List dense>
                                    {/* General Attachments */}
                                    {selectedCourse.itemId?.attachments?.map((file: any, idx: number) => (
                                        <ListItem key={`att-${idx}`} secondaryAction={
                                            <IconButton edge="end" onClick={() => handleDownload(file.filePath, file.fileName)}>
                                                <MdDownload />
                                            </IconButton>
                                        }>
                                            <ListItemIcon><MdDescription color="#3b82f6" /></ListItemIcon>
                                            <ListItemText primary={file.fileName} secondary="Course Material" />
                                        </ListItem>
                                    ))}
                                    {/* Student Delivery Files */}
                                    {selectedCourse.deliveryFiles?.map((file: any, idx: number) => (
                                        <ListItem key={`del-${idx}`} secondaryAction={
                                            <IconButton edge="end" onClick={() => handleDownload(file.filePath, file.fileName)}>
                                                <MdDownload />
                                            </IconButton>
                                        }>
                                            <ListItemIcon><MdDescription color="#10b981" /></ListItemIcon>
                                            <ListItemText primary={file.fileName} secondary="Your Course File" />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>

                            {/* Right Column: Status & Actions */}
                            <Grid xs={12} md={5}>
                                {/* Payment Status */}
                                <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Payment Status</Typography>
                                        {selectedCourse.payment?.status === "paid" ? (
                                            <Box>
                                                <Alert severity="success" sx={{ py: 0, mb: 1 }}>Paid</Alert>
                                                <Button
                                                    startIcon={<MdPayment />}
                                                    variant="text"
                                                    size="small"
                                                    fullWidth
                                                    disabled={generatingInvoice}
                                                    onClick={handleDownloadInvoice}
                                                >
                                                    {generatingInvoice ? "Generating..." : "Download Invoice"}
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box>
                                                <Alert severity="warning" sx={{ mb: 1 }}>
                                                    Pending: ₹{selectedCourse.payment?.amount || 0}
                                                    {selectedCourse.payment?.notes && <Box component="div" sx={{ fontSize: "0.8em", mt: 0.5 }}>{selectedCourse.payment.notes}</Box>}
                                                </Alert>

                                                {/* Show configured payment instructions */}
                                                {paymentSettings && (
                                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                        {paymentSettings.enableBankTransfer && (
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="600">Bank Transfer</Typography>
                                                                <Typography variant="body2">Account Holder: {paymentSettings.bankDetails?.accountHolderName || "-"}</Typography>
                                                                <Typography variant="body2">Account Number: {paymentSettings.bankDetails?.accountNumber || "-"}</Typography>
                                                                <Typography variant="body2">Bank: {paymentSettings.bankDetails?.bankName || "-"} | IFSC: {paymentSettings.bankDetails?.ifsc || "-"}</Typography>
                                                            </Box>
                                                        )}

                                                        {paymentSettings.enableUPI && (
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight="600" sx={{ mt: 1 }}>UPI / QR</Typography>
                                                                <Typography variant="body2">UPI ID: {paymentSettings.upiId || "-"}</Typography>
                                                                {paymentSettings.qrUrl && <Box component="img" src={paymentSettings.qrUrl} alt="UPI QR" sx={{ width: 120, height: 120, mt: 1 }} />}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Assignments */}
                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold">Assignments</Typography>
                                            <Button size="small" startIcon={<MdUpload />} onClick={() => { setDetailsModal(false); setUploadModal(true); }}>
                                                Upload
                                            </Button>
                                        </Box>
                                        {selectedCourse.courseSubmissions?.length > 0 ? (
                                            <List dense>
                                                {selectedCourse.courseSubmissions.map((sub: any, idx: number) => (
                                                    <ListItem key={idx} sx={{ px: 0 }}>
                                                        <ListItemIcon sx={{ minWidth: 32 }}><MdAttachFile /></ListItemIcon>
                                                        <ListItemText
                                                            primary={sub.fileName}
                                                            secondary={new Date(sub.uploadedAt).toLocaleDateString()}
                                                            primaryTypographyProps={{ variant: "body2", noWrap: true }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary" align="center" display="block">
                                                No submissions yet.
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Upload Modal */}
            <Dialog open={uploadModal} onClose={() => setUploadModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Assignment</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{
                                height: 100,
                                borderStyle: "dashed",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1
                            }}
                        >
                            <MdUpload size={32} />
                            {uploadFile ? uploadFile.name : "Click to select file"}
                            <input type="file" hidden onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                        </Button>
                        <TextField
                            label="Notes (Optional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Add any comments about your submission..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setUploadModal(false)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => uploadMutation.mutate()}
                        disabled={!uploadFile || uploadMutation.isPending}
                        sx={submitButtonStyle}
                    >
                        {uploadMutation.isPending ? "Uploading..." : "Submit Assignment"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Hidden Invoice Template */}
            <Box sx={{ position: "absolute", left: "-3000px", top: 0 }}>
                <div
                    ref={invoiceRef}
                    style={{
                        width: "210mm",
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
                            <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>Order # {selectedCourse?.payment?.transactionId || Date.now().toString().slice(-6)}</Typography>
                            <Typography variant="body2">Date: {new Date().toLocaleDateString()}</Typography>
                        </Box>
                    </Box>

                    {/* Bill To */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: "#555" }}>Bill To:</Typography>
                        <Typography variant="h6" fontWeight="bold">{selectedCourse?.student?.name || "Student Name"}</Typography>
                        <Typography variant="body2">{selectedCourse?.student?.email || "student@example.com"}</Typography>
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
                                Course Fee: <strong>{selectedCourse?.itemId?.name}</strong>
                                {selectedCourse?.payment?.notes && <span style={{ display: "block", fontSize: "0.8em", color: "#666" }}>{selectedCourse.payment.notes}</span>}
                            </Typography>
                            <Typography sx={{ flex: 1, textAlign: "center" }}>1</Typography>
                            <Typography sx={{ flex: 1, textAlign: "right" }}>₹{selectedCourse?.payment?.amount}</Typography>
                            <Typography sx={{ flex: 1, textAlign: "right" }}>₹{selectedCourse?.payment?.amount}</Typography>
                        </Box>
                    </Box>

                    {/* Total */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 6 }}>
                        <Box sx={{ width: "250px" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography>Subtotal:</Typography>
                                <Typography>₹{selectedCourse?.payment?.amount}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, fontWeight: "bold", fontSize: "1.2rem", borderTop: "2px solid #333", pt: 1 }}>
                                <Typography>Total:</Typography>
                                <Typography>₹{selectedCourse?.payment?.amount}</Typography>
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
                </div>
            </Box>
        </Box >
    );
};

export default MyCourses;
