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
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
    MdSchool,
    MdUpload,
    MdCheckCircle,
    MdPerson,
    MdAssignment
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

const InternshipSubmissionsList = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    // Modals state
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [uploadModal, setUploadModal] = useState(false);
    const [viewFilesModal, setViewFilesModal] = useState(false);
    // Certificate Generation
    const [certificateModal, setCertificateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    // Upload Form State
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    // Fetch assignments
    const { data: assignments, isLoading, error } = useQuery({
        queryKey: ["internship-assignments"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}admin/assignments?itemType=internship`,
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
                `${import.meta.env.VITE_APP_BASE_URL}admin/internship-assignments/${assignmentId}/upload-files`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Files uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["internship-assignments"] });
            setUploadModal(false);
            setUploadFiles([]);
            setFileTypes([]);
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to upload files");
        },
    });

    // Generate Certificate
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
                `${import.meta.env.VITE_APP_BASE_URL}admin/internship-assignments/${selectedAssignment._id}/complete`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );

            CustomSnackBar.successSnackbar("Certificate issued & Internship Completed!");
            queryClient.invalidateQueries({ queryKey: ["internship-assignments"] });
            setCertificateModal(false);
        } catch (err: any) {
            console.error("Certificate Error:", err);
            CustomSnackBar.errorSnackbar("Failed to generate certificate");
        } finally {
            setGenerating(false);
        }
    };

    // Filter Logic
    const filteredAssignments = assignments?.filter((item: any) => {
        if (tabValue === 0) return !["completed"].includes(item.status);
        if (tabValue === 1) return item.status === "completed";
        return true;
    });

    // Handlers
    const handleOpenUpload = (item: any) => { setSelectedAssignment(item); setUploadModal(true); setUploadFiles([]); setFileTypes([]); };
    const handleOpenViewFiles = (item: any) => { setSelectedAssignment(item); setViewFilesModal(true); };
    const handleOpenCertificate = (item: any) => { setSelectedAssignment(item); setCertificateModal(true); };

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

    if (isLoading) return <CircularProgress />;

    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tab label="Active Internships" />
                    <Tab label="Completed / Certified" />
                </Tabs>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Internship Title</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Assigned At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAssignments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No assignments found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredAssignments?.map((row: any) => (
                                    <TableRow key={row._id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{row.student?.name}</Typography>
                                            <Typography variant="caption">{row.student?.email}</Typography>
                                        </TableCell>
                                        <TableCell>{row.itemId?.title || row.itemId?.name}</TableCell>
                                        <TableCell>
                                            <Chip label={row.status} color={row.status === "completed" ? "success" : "warning"} size="small" />
                                        </TableCell>
                                        <TableCell>{new Date(row.assignedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                {row.status !== "completed" ? (
                                                    <>
                                                        <Button size="small" variant="contained" onClick={() => handleOpenUpload(row)} startIcon={<MdUpload />} sx={{ ...smallPrimaryButton }}>
                                                            Files
                                                        </Button>
                                                        <Button size="small" variant="outlined" color="success" onClick={() => handleOpenCertificate(row)} startIcon={<IoCheckmarkDoneCircle />}>
                                                            Complete
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button size="small" variant="text" href={row.certificate?.url} target="_blank" startIcon={<MdDownload />}>
                                                        Certificate
                                                    </Button>
                                                )}
                                                <IconButton size="small" onClick={() => handleOpenViewFiles(row)}>
                                                    <MdVisibility />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>



            {/* Hidden Certificate Template for Generation */}
            < Box sx={{ position: "absolute", left: "-3000px", top: 0 }}>
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
                            Of Internship Completion
                        </h3>

                        <h4 style={{ marginTop: "30px", fontFamily: "Trykker", fontSize: "18px", color: "#545151" }}>
                            This Certificate is Proudly Presented to
                        </h4>

                        <h5 style={{ marginTop: "10px", fontFamily: "Style Script", fontSize: "35px", color: "#545151" }}>
                            {selectedAssignment?.student?.name || "Student Name"}
                        </h5>

                        <h6 style={{ margin: "10px auto 0 auto", fontFamily: "Trykker", fontSize: "16px", color: "#545151", maxWidth: "85%", lineHeight: "1.5" }}>
                            Has successfully completed the internship as <strong>{selectedAssignment?.itemId?.title}</strong> at Skill Up Tech Solution.
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
            </Box >
        </Box >
    );
};

export default InternshipSubmissionsList;
