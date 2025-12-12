import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Grid,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { MdDownload, MdCloudDownload, MdCheckCircle, MdDescription } from "react-icons/md";
import { textLinkStyle } from "../../assets/Styles/ButtonStyles";

const MyInternships = () => {
    const token = Cookies.get("skToken");

    const { data, isLoading, error } = useQuery({
        queryKey: ["my-internships"],
        queryFn: async () => {
            const response = await axios.get(
                `${import.meta.env.VITE_APP_BASE_URL}student/my-internships`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "success";
            case "in-progress":
            case "Active":
            case "Ongoing":
                return "primary";
            case "ready-for-download":
                return "success";
            default:
                return "default";
        }
    };

    const handleDownloadFile = (filePath: string, fileName: string) => {
        const url = filePath.startsWith("http")
            ? filePath
            : `${import.meta.env.VITE_APP_BASE_URL}${filePath}`;

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                💼 My Internships
            </Typography>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">Failed to load internships.</Alert>
            ) : !data || data.length === 0 ? (
                <Alert severity="info">No internships assigned yet. Contact admin to get started!</Alert>
            ) : (
                <Grid container spacing={3}>
                    {data.map((assignment: any) => {
                        const internship = assignment.itemId;
                        const isCompleted = assignment.status === "completed";
                        const canDownload = assignment.deliveryFiles?.length > 0;

                        return (
                            <Grid item xs={12} md={6} lg={4} key={assignment._id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                        border: "1px solid #e5e7eb",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                                            transform: "translateY(-4px)",
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight="600">
                                                    {internship?.title || internship?.name || "Internship"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {internship?.company}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={assignment.status}
                                                size="small"
                                                color={getStatusColor(assignment.status)}
                                                sx={{ textTransform: "capitalize" }}
                                            />
                                        </Box>

                                        {internship?.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                                {internship.description.substring(0, 100)}...
                                            </Typography>
                                        )}

                                        {/* Progress */}
                                        <Box sx={{ mb: 3 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">Progress</Typography>
                                                <Typography variant="caption" fontWeight="bold">{assignment.progress}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={assignment.progress}
                                                color={isCompleted ? "success" : "primary"}
                                                sx={{ height: 6, borderRadius: 3 }}
                                            />
                                        </Box>

                                        {/* Downloads Section */}
                                        {canDownload && (
                                            <Box sx={{ mb: 2, p: 2, bgcolor: "#f0fdf4", border: "1px solid #86efac", borderRadius: 2 }}>
                                                <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                                    <MdCloudDownload /> Internship Files
                                                </Typography>
                                                <List dense disablePadding>
                                                    {assignment.deliveryFiles.map((file: any, idx: number) => (
                                                        <ListItem key={idx} sx={{ px: 0, py: 0.5 }} secondaryAction={
                                                            <IconButton edge="end" size="small" onClick={() => handleDownloadFile(file.filePath, file.fileName)}>
                                                                <MdDownload />
                                                            </IconButton>
                                                        }>
                                                            <ListItemIcon sx={{ minWidth: 30 }}><MdDescription /></ListItemIcon>
                                                            <ListItemText
                                                                primary={file.fileName}
                                                                primaryTypographyProps={{ variant: "caption", noWrap: true }}
                                                                secondary={file.fileType}
                                                                secondaryTypographyProps={{ variant: "caption", fontSize: "0.65rem" }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        )}

                                        {/* Certificate */}
                                        {assignment.certificate?.url && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                fullWidth
                                                startIcon={<MdCheckCircle />}
                                                onClick={() => handleDownloadFile(assignment.certificate.url, "Internship_Certificate.pdf")}
                                                sx={{ mb: 2 }}
                                            >
                                                Download Certificate
                                            </Button>
                                        )}

                                        {internship?.duration && (
                                            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                                                Duration: {internship.duration}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default MyInternships;
