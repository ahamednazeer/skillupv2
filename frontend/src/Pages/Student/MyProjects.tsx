import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Rating,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stepper,
    Step,
    StepLabel,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { MdExpandMore, MdDownload, MdDescription, MdCode, MdPictureAsPdf, MdVideoLibrary, MdCheck, MdSchedule, MdPayment, MdCloudDownload } from "react-icons/md";
import CustomSnackBar from "../../Custom/CustomSnackBar";
import { submitButtonStyle, smallPrimaryButton, cancelButtonStyle, textLinkStyle } from "../../assets/Styles/ButtonStyles";

const projectTypeOptions = [
    { value: "website", label: "Website Development" },
    { value: "mobile-app", label: "Mobile App" },
    { value: "report", label: "Project Report" },
    { value: "ppt", label: "Presentation (PPT)" },
    { value: "research", label: "Research Paper" },
    { value: "code", label: "Coding Project" },
    { value: "design", label: "Design Work" },
    { value: "other", label: "Other" },
];

// Linear Flow Steps
const steps = [
    { label: "Assigned", value: "assigned" },
    { label: "Requirements", value: "requirement-submitted" },
    { label: "Advance Payment", value: "advance-payment-pending" },
    { label: "Work In Progress", value: "in-progress" },
    { label: "Ready for Demo", value: "ready-for-demo" },
    { label: "Final Payment", value: "final-payment-pending" },
    { label: "Project Files", value: "ready-for-download" },
    { label: "Delivered", value: "delivered" }
];

const getActiveStep = (status: string) => {
    // Map status to step index
    switch (status) {
        case "assigned": return 0;
        case "requirement-submitted": case "requirement-submitted-admin": return 1;
        case "advance-payment-pending": return 2;
        case "in-progress": return 3;
        case "ready-for-demo": return 4;
        case "final-payment-pending": return 5;
        case "ready-for-download": return 6;
        case "delivered": case "completed": return 8; // All done
        default: return 0;
    }
};

const getFileIcon = (fileType: string) => {
    const style = { fontSize: 24 };
    switch (fileType) {
        case "ppt": return <MdDescription style={{ ...style, color: "#f97316" }} />;
        case "source-code": return <MdCode style={{ ...style, color: "#10b981" }} />;
        case "report": case "documentation": return <MdPictureAsPdf style={{ ...style, color: "#ef4444" }} />;
        case "video": return <MdVideoLibrary style={{ ...style, color: "#6366f1" }} />;
        default: return <MdDescription style={{ ...style, color: "#3b82f6" }} />;
    }
};

const MyProjects = () => {
    const token = Cookies.get("skToken");
    const queryClient = useQueryClient();

    // State for modals
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [requirementModal, setRequirementModal] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState(false);

    // Form states
    const [requirementForm, setRequirementForm] = useState({
        projectType: "other", collegeGuidelines: "", notes: ""
    });
    const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comments: "" });

    // Fetch all projects
    const { data, isLoading, error } = useQuery({
        queryKey: ["my-projects"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-projects`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
    });

    // Deep Linking: Scroll to specific project if projectId is in URL
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const projectId = params.get("projectId");

        if (projectId && data && !isLoading) {
            // Slight delay to ensure rendering
            setTimeout(() => {
                const element = document.getElementById(projectId);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    // Optional: temporary highlight
                    element.style.border = "2px solid #f57f17";
                    setTimeout(() => {
                        element.style.border = "1px solid #e5e7eb";
                    }, 3000);
                }
            }, 500);
        }
    }, [data, isLoading, location.search]);

    // Submit requirement mutation
    const submitRequirementMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/projects/${assignmentId}/submit-requirement`,
                { ...requirementForm, topic: selectedProject?.itemId?.title || selectedProject?.itemId?.name || "Project Submission" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Requirement submitted successfully!");
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
            setRequirementModal(false);
            setRequirementForm({ projectType: "other", collegeGuidelines: "", notes: "" });
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to submit");
        },
    });

    // Mark delivered mutation
    const markDeliveredMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/projects/${assignmentId}/mark-delivered`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Thank you! Project marked as delivered.");
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to mark delivered");
        },
    });

    // Submit feedback mutation
    const submitFeedbackMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_BASE_URL}student/projects/${assignmentId}/feedback`,
                feedbackForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        onSuccess: () => {
            CustomSnackBar.successSnackbar("Thank you for your feedback!");
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
            setFeedbackModal(false);
            setFeedbackForm({ rating: 0, comments: "" });
        },
        onError: (err: any) => {
            CustomSnackBar.errorSnackbar(err.response?.data?.message || "Failed to submit feedback");
        },
    });

    const handleOpenRequirement = (project: any) => {
        setSelectedProject(project);
        setRequirementModal(true);
    };

    const handleOpenFeedback = (project: any) => {
        setSelectedProject(project);
        setFeedbackModal(true);
    };

    const handleDownloadFile = (filePath: string, fileName: string) => {
        const url = filePath.startsWith("http")
            ? filePath
            : `${import.meta.env.VITE_APP_BASE_URL}${filePath}`;

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName; // Note: for cross-origin URLs, download attribute may be ignored by browser
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">Failed to load projects.</Alert>;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                🚀 My Projects
            </Typography>

            {!data || data.length === 0 ? (
                <Alert severity="info">No projects assigned yet. Contact admin to get started!</Alert>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {data.map((assignment: any) => {
                        const project = assignment.itemId;
                        const activeStep = getActiveStep(assignment.status);
                        const canSubmitRequirement = assignment.status === "assigned";
                        const canDownload = ["ready-for-download", "delivered", "completed"].includes(assignment.status);
                        const canGiveFeedback = ["delivered", "completed"].includes(assignment.status) && !assignment.feedback?.submittedAt;
                        const requirementSubmitted = assignment.requirementSubmission?.submittedAt;

                        return (
                            <Card key={assignment._id} id={assignment.itemId?._id || assignment._id} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "visible" }}>
                                <CardContent sx={{ p: 3 }}>
                                    {/* Header */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 2, mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="600">{project?.title || project?.name || "Project"}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Chip label={steps[Math.min(activeStep, steps.length - 1)].label} color={activeStep >= 7 ? "success" : "primary"} size="small" />
                                    </Box>

                                    {/* Project Details */}
                                    <Box sx={{ mb: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>Project Details</Typography>
                                        {project?.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{project.description}</Typography>
                                        )}
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                                            {project?.deadline && <Typography variant="caption">📅 Deadline: {new Date(project.deadline).toLocaleDateString()}</Typography>}
                                            {project?.mentor && <Typography variant="caption">👨‍🏫 Mentor: {project.mentor}</Typography>}
                                            {project?.projectType && <Typography variant="caption">📂 Type: {project.projectType}</Typography>}
                                        </Box>
                                        {project?.requirements && (
                                            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                                                <strong>Requirements:</strong> {project.requirements}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* PROGRESS STEPPER */}
                                    <Box sx={{ mb: 4, width: '100%', overflowX: 'auto' }}>
                                        <Stepper activeStep={activeStep} alternativeLabel>
                                            {steps.map((step) => (
                                                <Step key={step.label}>
                                                    <StepLabel>{step.label}</StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Box>

                                    {/* Action Areas */}

                                    {/* 1. Submitted Requirements (Read Only) */}
                                    {requirementSubmitted && (
                                        <Accordion sx={{ mb: 2, border: "1px solid #e5e7eb", borderRadius: 2, "&:before": { display: "none" } }}>
                                            <AccordionSummary expandIcon={<MdExpandMore />}>
                                                <Typography variant="subtitle2" fontWeight="600" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    ✅ Requirements Submitted
                                                    {assignment.requirementSubmission.submittedByRole === "admin" && (
                                                        <Chip label="By Admin" size="small" color="default" sx={{ ml: 1, height: 20, fontSize: 10 }} />
                                                    )}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                                    <Typography variant="body2"><strong>Topic:</strong> {assignment.requirementSubmission.topic}</Typography>
                                                    <Typography variant="body2"><strong>Type:</strong> {assignment.requirementSubmission.projectType}</Typography>
                                                    {assignment.requirementSubmission.collegeGuidelines && (
                                                        <Typography variant="body2"><strong>Guidelines:</strong> {assignment.requirementSubmission.collegeGuidelines}</Typography>
                                                    )}
                                                    {assignment.requirementSubmission.notes && (
                                                        <Typography variant="body2"><strong>Notes:</strong> {assignment.requirementSubmission.notes}</Typography>
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        Date: {new Date(assignment.requirementSubmission.submittedAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    )}

                                    {/* 2. Submit Requirements (Action) */}
                                    {canSubmitRequirement && (
                                        <Box sx={{ mb: 2, p: 2, bgcolor: "#fff7ed", border: "1px solid #fdba74", borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
                                                📝 Action Required: Submit Requirements
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Please submit your project details to proceed.
                                            </Typography>
                                            <Button variant="contained" onClick={() => handleOpenRequirement(assignment)} sx={{ ...submitButtonStyle }}>
                                                Submit Requirement
                                            </Button>
                                        </Box>
                                    )}

                                    {/* 2. Advance Payment */}
                                    {assignment.status === "advance-payment-pending" && (
                                        <Alert severity="warning" sx={{ mb: 2 }} icon={<MdPayment fontSize="inherit" />}>
                                            <Typography variant="subtitle2" fontWeight="bold">Advance Payment Required</Typography>
                                            <Typography variant="body2">
                                                An advance payment of <strong>₹{assignment.payment?.amount || "N/A"}</strong> is required to start the work.
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                Please contact admin to complete the payment.
                                            </Typography>
                                            {assignment.payment?.notes && <Typography variant="caption" display="block">Note: {assignment.payment.notes}</Typography>}
                                        </Alert>
                                    )}

                                    {/* 3. In Progress */}
                                    {assignment.status === "in-progress" && (
                                        <Alert severity="info" sx={{ mb: 2 }} icon={<MdSchedule fontSize="inherit" />}>
                                            <Typography variant="subtitle2" fontWeight="bold">Work In Progress</Typography>
                                            <Typography variant="body2">
                                                Our team is currently working on your project. We'll update you when it's ready for a demo.
                                            </Typography>
                                        </Alert>
                                    )}

                                    {/* 4. Ready for Demo */}
                                    {assignment.status === "ready-for-demo" && (
                                        <Alert severity="success" sx={{ mb: 2 }} icon={<MdCheck fontSize="inherit" />}>
                                            <Typography variant="subtitle2" fontWeight="bold">Ready for Demo!</Typography>
                                            <Typography variant="body2">
                                                Your project is ready for a demo. Please check with your admin/mentor to schedule it.
                                            </Typography>
                                        </Alert>
                                    )}

                                    {/* 5. Final Payment */}
                                    {assignment.status === "final-payment-pending" && (
                                        <Alert severity="warning" sx={{ mb: 2 }} icon={<MdPayment fontSize="inherit" />}>
                                            <Typography variant="subtitle2" fontWeight="bold">Final Payment Required</Typography>
                                            <Typography variant="body2">
                                                Please complete the final payment of <strong>₹{assignment.payment?.amount || "N/A"}</strong> to receive your delivery files.
                                            </Typography>
                                        </Alert>
                                    )}

                                    {/* 6. Downloads */}
                                    {canDownload && assignment.deliveryFiles?.length > 0 && (
                                        <Box sx={{ mb: 2, p: 2, bgcolor: "#f0fdf4", border: "1px solid #86efac", borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                                <MdCloudDownload /> Download Your Project Files
                                            </Typography>
                                            <List dense>
                                                {assignment.deliveryFiles.map((file: any, idx: number) => (
                                                    <ListItem key={idx} secondaryAction={
                                                        <IconButton edge="end" onClick={() => handleDownloadFile(file.filePath, file.fileName)}>
                                                            <MdDownload />
                                                        </IconButton>
                                                    }>
                                                        <ListItemIcon>{getFileIcon(file.fileType)}</ListItemIcon>
                                                        <ListItemText primary={file.fileName} secondary={file.fileType} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                            {assignment.status === "ready-for-download" && (
                                                <Button variant="contained" onClick={() => markDeliveredMutation.mutate(assignment._id)} disabled={markDeliveredMutation.isPending} sx={{ ...smallPrimaryButton, mt: 1 }}>
                                                    ✅ I have downloaded the files (Mark as Delivered)
                                                </Button>
                                            )}
                                        </Box>
                                    )}

                                    {/* Feedback Section */}
                                    {assignment.feedback?.submittedAt ? (
                                        <Box sx={{ mt: 2, p: 2, bgcolor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="600">⭐ Your Feedback</Typography>
                                            <Rating value={assignment.feedback.rating} readOnly sx={{ mt: 1 }} />
                                            {assignment.feedback.comments && (
                                                <Typography variant="body2" sx={{ mt: 1 }}>{assignment.feedback.comments}</Typography>
                                            )}
                                        </Box>
                                    ) : canGiveFeedback && (
                                        <Button variant="outlined" color="warning" onClick={() => handleOpenFeedback(assignment)} sx={{ ...textLinkStyle, mt: 2 }}>
                                            ⭐ Give Feedback
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Requirement Submission Modal */}
                    <Dialog open={requirementModal} onClose={() => setRequirementModal(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Submit Your Project Requirement</DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                                <Alert severity="info">Project Title will be used as the Topic.</Alert>
                                {selectedProject?.itemId?.deliverables?.length > 0 && (
                                    <Alert severity="warning">
                                        <strong>Required Deliverables:</strong> {selectedProject.itemId.deliverables.join(", ")}
                                    </Alert>
                                )}
                                <TextField select label="What do you need?" value={requirementForm.projectType} onChange={(e) => setRequirementForm({ ...requirementForm, projectType: e.target.value })} fullWidth>
                                    {projectTypeOptions.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField label="College/University Guidelines" value={requirementForm.collegeGuidelines} onChange={(e) => setRequirementForm({ ...requirementForm, collegeGuidelines: e.target.value })} fullWidth multiline rows={3} placeholder="Any specific format, word count, referencing style, etc." />
                                <TextField label="Additional Notes / Instructions" value={requirementForm.notes} onChange={(e) => setRequirementForm({ ...requirementForm, notes: e.target.value })} fullWidth multiline rows={3} placeholder="Any other details you want us to know..." />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setRequirementModal(false)}>Cancel</Button>
                            <Button variant="contained" onClick={() => submitRequirementMutation.mutate(selectedProject?._id)} disabled={submitRequirementMutation.isPending} sx={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
                                {submitRequirementMutation.isPending ? "Submitting..." : "Submit Requirement"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Feedback Modal */}
                    <Dialog open={feedbackModal} onClose={() => setFeedbackModal(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Rate Your Experience</DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, alignItems: "center" }}>
                                <Typography variant="body2">How satisfied are you with the project delivery?</Typography>
                                <Rating size="large" value={feedbackForm.rating} onChange={(_, value) => setFeedbackForm({ ...feedbackForm, rating: value || 0 })} />
                                <TextField label="Comments (Optional)" value={feedbackForm.comments} onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })} fullWidth multiline rows={3} placeholder="Share your thoughts..." />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setFeedbackModal(false)}>Cancel</Button>
                            <Button variant="contained" onClick={() => submitFeedbackMutation.mutate(selectedProject?._id)} disabled={feedbackForm.rating === 0 || submitFeedbackMutation.isPending} sx={{ background: "linear-gradient(135deg, #f59e0b, #eab308)" }}>
                                {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}
        </Box>
    );
};

export default MyProjects;
