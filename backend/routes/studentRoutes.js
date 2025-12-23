const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { studentOnly } = require("../middleware/roleAuth");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const StudentAssignment = require("../models/StudentAssignment");
const Announcement = require("../models/Announcement");
const submissionController = require("../controllers/submissionController");
const upload = require("../config/multer");

// ===== Public Routes (No Auth Required) =====

// Student Self Signup
router.post("/signup", async (req, res) => {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (name.length < 3) {
        return res.status(400).json({ message: "Name must be at least 3 characters long" });
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
        return res.status(400).json({ message: "Invalid Email Address" });
    }

    if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: "student",
            status: "Self-Signed"
        });

        res.status(201).json({
            message: "Registration successful. You can now login.",
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
                status: student.status
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Activate Account (from invite link)
router.post("/activate", async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        const user = await User.findOne({
            inviteToken: token,
            inviteTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired activation link" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            status: "Active",
            inviteToken: undefined,
            inviteTokenExpires: undefined,
            updatedAt: Date.now()
        });

        res.status(200).json({ message: "Account activated successfully. You can now login." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Validate activation token
router.get("/validate-token/:token", async (req, res) => {
    try {
        const user = await User.findOne({
            inviteToken: req.params.token,
            inviteTokenExpires: { $gt: Date.now() }
        }).select("name email");

        if (!user) {
            return res.status(400).json({ valid: false, message: "Invalid or expired activation link" });
        }

        res.status(200).json({ valid: true, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== Protected Student Routes =====
router.use(auth);
router.use(studentOnly);

// Get my profile
router.get("/me", async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password -inviteToken -inviteTokenExpires");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update my profile
router.put("/me", async (req, res) => {
    const { name, mobile } = req.body;

    try {
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { name, mobile, updatedAt: Date.now() },
            { new: true }
        ).select("-password -inviteToken -inviteTokenExpires");

        res.status(200).json({ message: "Profile updated", user: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get my courses
router.get("/my-courses", async (req, res) => {
    try {
        const assignments = await StudentAssignment.find({
            student: req.user.id,
            itemType: "course"
        }).populate("itemId").sort({ assignedAt: -1 });

        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get my internships
router.get("/my-internships", async (req, res) => {
    try {
        const assignments = await StudentAssignment.find({
            student: req.user.id,
            itemType: "internship"
        }).populate("itemId").sort({ assignedAt: -1 });

        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get my projects
router.get("/my-projects", async (req, res) => {
    try {
        const assignments = await StudentAssignment.find({
            student: req.user.id,
            itemType: "project"
        }).populate("itemId").populate("submission").sort({ assignedAt: -1 });

        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all my assignments
router.get("/my-assignments", async (req, res) => {
    try {
        const assignments = await StudentAssignment.find({ student: req.user.id })
            .populate("itemId")
            .populate("submission")
            .sort({ assignedAt: -1 });

        const grouped = {
            courses: assignments.filter(a => a.itemType === "course"),
            internships: assignments.filter(a => a.itemType === "internship"),
            projects: assignments.filter(a => a.itemType === "project")
        };

        res.status(200).json({ assignments, grouped });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get dashboard stats
router.get("/dashboard", async (req, res) => {
    try {
        const assignments = await StudentAssignment.find({ student: req.user.id });

        const stats = {
            totalCourses: assignments.filter(a => a.itemType === "course").length,
            totalInternships: assignments.filter(a => a.itemType === "internship").length,
            totalProjects: assignments.filter(a => a.itemType === "project").length,
            completed: assignments.filter(a => a.status === "completed").length,
            inProgress: assignments.filter(a => a.status === "in-progress").length,
            assigned: assignments.filter(a => a.status === "assigned").length
        };

        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ["all", "students"] }
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({ stats, recentAnnouncements: announcements });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get announcements
router.get("/announcements", async (req, res) => {
    try {
        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ["all", "students"] }
        })
            .populate("createdBy", "name")
            .sort({ priority: -1, createdAt: -1 });

        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submission routes
router.post("/submissions", submissionController.createSubmission);
router.get("/my-submissions", submissionController.getMySubmissions);
router.put("/submissions/:id/resubmit", submissionController.resubmitProject);

// ===== PROJECT WORKFLOW ROUTES =====

// Get single project assignment with all details
router.get("/projects/:assignmentId", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        })
            .populate("itemId")
            .populate("submission")
            .populate("requirementSubmission.submittedBy", "name email")
            .populate("adminReview.reviewedBy", "name email")
            .populate("deliveryFiles.uploadedBy", "name email");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(assignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const sendProjectEmail = require("../utils/sendProjectMail");

// Submit project requirement
// Submit project requirement
router.post("/projects/:assignmentId/submit-requirement", upload.array("files"), async (req, res) => {
    try {
        const { topic, projectType, collegeGuidelines, notes } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "Project topic is required" });
        }

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        }).populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Don't allow if already submitted
        if (assignment.requirementSubmission?.submittedAt) {
            return res.status(400).json({ message: "Requirement already submitted" });
        }

        // Process uploaded files
        const attachments = req.files ? req.files.map(file => ({
            fileName: file.originalname,
            filePath: file.path || file.location, // Support local or S3/B2
            uploadedAt: new Date()
        })) : [];

        assignment.requirementSubmission = {
            topic,
            projectType: projectType || "other",
            collegeGuidelines: collegeGuidelines || "",
            notes: notes || "",
            attachments: attachments,
            submittedBy: req.user.id,
            submittedByRole: "student",
            submittedAt: new Date()
        };
        assignment.status = "requirement-submitted";

        await assignment.save();

        // Send email to Admin
        await sendProjectEmail("REQUIREMENT_SUBMITTED", { email: process.env.ADMIN_EMAIL || "admin@skillup.com", name: "Admin" }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name,
            studentName: req.user.name,
            topic: topic,
            type: projectType
        });

        // Send confirmation to student
        await sendProjectEmail("REQUIREMENT_RECEIVED", { email: req.user.email, name: req.user.name }, {
            projectTitle: assignment.itemId.title || assignment.itemId.name
        });

        res.status(200).json({
            message: "Requirement submitted successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get delivery files for download
router.get("/projects/:assignmentId/delivery-files", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        }).select("deliveryFiles status");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (!["ready-for-download", "delivered", "completed"].includes(assignment.status)) {
            return res.status(400).json({ message: "Files not ready for download yet" });
        }

        res.status(200).json(assignment.deliveryFiles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark as delivered (when student downloads)
router.post("/projects/:assignmentId/mark-delivered", async (req, res) => {
    try {
        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project",
            status: "ready-for-download"
        }).populate("itemId");

        if (!assignment) {
            return res.status(404).json({ message: "Project not found or not ready" });
        }

        assignment.status = "delivered";
        await assignment.save();

        const projectTitle = assignment.itemId.title || assignment.itemId.name;

        // Send email to Admin (Student Downloaded)
        await sendProjectEmail("STUDENT_DOWNLOADED", { email: process.env.ADMIN_EMAIL || "admin@skillup.com", name: "Admin" }, {
            projectTitle,
            studentName: req.user.name
        });

        // Send Feedback Request to Student
        await sendProjectEmail("FEEDBACK_REQUEST", { email: req.user.email, name: req.user.name }, {
            projectTitle
        });

        res.status(200).json({
            message: "Marked as delivered",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit feedback
router.post("/projects/:assignmentId/feedback", async (req, res) => {
    try {
        const { rating, comments } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "project"
        });

        if (!assignment) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (!["delivered", "completed"].includes(assignment.status)) {
            return res.status(400).json({ message: "Can only give feedback after delivery" });
        }

        assignment.feedback = {
            rating,
            comments: comments || "",
            submittedAt: new Date()
        };

        // Mark as completed if feedback is given
        assignment.status = "completed";
        assignment.completedAt = new Date();

        await assignment.save();

        res.status(200).json({
            message: "Feedback submitted successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== COURSE WORKFLOW ROUTES =====

const b2Service = require("../utils/b2Service");


// Upload course assignment
router.post("/courses/:assignmentId/upload-assignment", upload.single("file"), async (req, res) => {
    try {
        const { notes } = req.body;

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id,
            itemType: "course"
        });

        if (!assignment) {
            return res.status(404).json({ message: "Course assignment not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "course-submissions");

        assignment.courseSubmissions.push({
            fileName: req.file.originalname,
            filePath: uploadResult.url,
            uploadedBy: req.user.id,
            uploadedByRole: "student",
            uploadedAt: new Date(),
            notes: notes || ""
        });

        await assignment.save();

        res.status(200).json({
            message: "Assignment uploaded successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ===== PAYMENT PROOF UPLOAD =====

// Upload payment proof for any assignment type (course/project/internship)
router.post("/assignments/:assignmentId/upload-payment-proof", upload.single("proofFile"), async (req, res) => {
    try {
        const { paymentMethod, transactionId } = req.body;

        const assignment = await StudentAssignment.findOne({
            _id: req.params.assignmentId,
            student: req.user.id
        }).populate("itemId").populate("student", "name email");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (assignment.payment?.status !== "pending") {
            return res.status(400).json({ message: "Payment is not pending for this assignment" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No proof file uploaded" });
        }

        // Upload to B2
        const uploadResult = await b2Service.uploadFile(req.file.buffer, req.file.originalname, "payment-proofs");

        // Update payment with proof details
        assignment.payment.proofFile = uploadResult.url;
        assignment.payment.proofUploadedAt = new Date();
        assignment.payment.paymentMethod = paymentMethod || "other";
        if (transactionId) {
            assignment.payment.transactionId = transactionId;
        }

        await assignment.save();

        // Notify Admin
        const itemName = assignment.itemId?.name || assignment.itemId?.title || "Item";
        const itemType = assignment.itemType.charAt(0).toUpperCase() + assignment.itemType.slice(1);

        // Send email notification to admin
        try {
            const sendProjectEmail = require("../utils/sendProjectMail");
            await sendProjectEmail("PAYMENT_PROOF_UPLOADED", {
                email: process.env.ADMIN_EMAIL || "admin@skillup.com",
                name: "Admin"
            }, {
                studentName: req.user.name,
                itemType: itemType,
                itemName: itemName,
                amount: assignment.payment.amount,
                paymentMethod: paymentMethod || "other"
            });
        } catch (emailErr) {
            console.error("Failed to send admin notification:", emailErr);
        }

        res.status(200).json({
            message: "Payment proof uploaded successfully",
            assignment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

