import { createHashRouter } from "react-router-dom";
import Login from "../Auth/Login";
import SignUp from "../Auth/SignUp";
import ForgetPassword from "../Auth/ForgetPassword";
import StudentSignup from "../Auth/StudentSignup";
import ActivateAccount from "../Auth/ActivateAccount";
import Layout from "../Components/Layout";
import StudentLayout from "../Components/StudentLayout";
import Users from "../Custom/Users";
import Courses from "../Pages/Courses";
import Offers from "../Pages/Offers";
import Category from "../Pages/Category";
import Carrers from "../Pages/Carrers";
import Syllabus from "../Pages/Syllabus";
import WebsiteLayout from "../Components/WebsiteLayout";
import WebHome from "../Components/WebHome";
import WebAbout from "../Components/WebAbout";
import WebContactUs from "../Pages/WebContactUs";
import WebCarrers from "../Components/WebCarrers";
import WebCoursesPage from "../Pages/WebCoursesPage";
import WebItServices from "../Components/WebItServices";
import WebServicesPage from "../Pages/WebServicesPage";
import WebServiceDetail from "../Pages/WebServiceDetail";
import WebCategory from "../Pages/WebCategory";
import AdminDashboard from "../Pages/AdminDashboard";
import WebSyllabusView from "../Pages/WebSyllabusView";
import Certificate from "../Pages/Certificate";
import ResetPassword from "../Auth/ResetPassword";
import Review from "../Auth/Review";
import ProtectedRoute from "./ProtectedRoute";

// Student Pages
import StudentDashboard from "../Pages/Student/StudentDashboard";
import MyCourses from "../Pages/Student/MyCourses";
import MyInternships from "../Pages/Student/MyInternships";
import MyProjects from "../Pages/Student/MyProjects";
import Pay from "../Pages/Student/Pay";
import StudentAnnouncements from "../Pages/Student/StudentAnnouncements";
import StudentProfile from "../Pages/Student/StudentProfile";
import SubmitProject from "../Pages/Student/SubmitProject";

import AnnouncementManagement from "../Pages/AnnouncementManagement";
import SubmissionsManagement from "../Pages/SubmissionsManagement";
import ProjectSubmissions from "../Pages/ProjectSubmissions";
import InternshipManagement from "../Pages/InternshipManagement";
import ProjectManagement from "../Pages/ProjectManagement";
import StudentDetail from "../Pages/StudentDetail";
import EmployeeManagement from "../Pages/Admin/Payroll/EmployeeManagement";
import SalarySetup from "../Pages/Admin/Payroll/SalarySetup";
import GeneratePayslip from "../Pages/Admin/Payroll/GeneratePayslip";
import PayslipHistory from "../Pages/Admin/Payroll/PayslipHistory";
import EmployeePortal from "../Pages/Employee/EmployeePortal";
import PayslipSettings from "../Pages/Admin/Payroll/PayslipSettings";
import PaymentSettings from "../Pages/Admin/PaymentSettings";

const routes = createHashRouter([
  // Auth Routes
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/student-signup",
    element: <StudentSignup />,
  },
  {
    path: "/activate-account",
    element: <ActivateAccount />,
  },
  {
    path: "/forgotpassword",
    element: <ForgetPassword />,
  },
  {
    path: "/reviews",
    element: <Review />,
  },

  // Public Website Routes
  {
    path: "/",
    element: <WebsiteLayout />,
    children: [
      {
        path: "/",
        element: <WebHome />,
      },
      {
        path: "/about",
        element: <WebAbout />,
      },
      {
        path: "/contact",
        element: <WebContactUs />,
      },
      {
        path: "/careers",
        element: <WebCarrers />,
      },
      {
        path: "/services/courses",
        element: <WebCoursesPage />,
      },
      {
        path: "/itservices",
        element: <WebItServices />,
      },
      {
        path: "/services",
        element: <WebServicesPage />,
      },
      {
        path: "/services/details",
        element: <WebServiceDetail />,
      },
      {
        path: "/services/category",
        element: <WebCategory />,
      },
      {
        path: "/services/courses/syllabus",
        element: <WebSyllabusView />,
      },
    ],
  },

  // Admin Routes (Admin Only)
  {
    path: "/",
    element: <ProtectedRoute element={<Layout />} allowedRoles={["admin"]} />,
    children: [
      {
        path: "dashboard",
        element: <ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />,
      },
      {
        path: "users",
        element: <ProtectedRoute element={<Users />} allowedRoles={["admin"]} />,
      },
      {
        path: "courses",
        element: <ProtectedRoute element={<Courses />} allowedRoles={["admin"]} />,
      },
      {
        path: "offers",
        element: <ProtectedRoute element={<Offers />} allowedRoles={["admin"]} />,
      },
      {
        path: "category",
        element: <ProtectedRoute element={<Category />} allowedRoles={["admin"]} />,
      },
      {
        path: "admincareers",
        element: <ProtectedRoute element={<Carrers />} allowedRoles={["admin"]} />,
      },
      {
        path: "syllabus",
        element: <ProtectedRoute element={<Syllabus />} allowedRoles={["admin"]} />,
      },
      {
        path: "certificate",
        element: <ProtectedRoute element={<Certificate />} allowedRoles={["admin"]} />,
      },
      {
        path: "announcements",
        element: <ProtectedRoute element={<AnnouncementManagement />} allowedRoles={["admin"]} />,
      },
      {
        path: "submissions",
        element: <ProtectedRoute element={<SubmissionsManagement />} allowedRoles={["admin"]} />,
      },
      {
        path: "project-submissions",
        element: <ProtectedRoute element={<ProjectSubmissions />} allowedRoles={["admin"]} />,
      },
      {
        path: "internships",
        element: <ProtectedRoute element={<InternshipManagement />} allowedRoles={["admin"]} />,
      },
      {
        path: "projects",
        element: <ProtectedRoute element={<ProjectManagement />} allowedRoles={["admin"]} />,
      },
      {
        path: "student/:id",
        element: <ProtectedRoute element={<StudentDetail />} allowedRoles={["admin"]} />,
      },
      // Payroll Routes
      {
        path: "employees",
        element: <ProtectedRoute element={<EmployeeManagement />} allowedRoles={["admin"]} />,
      },
      {
        path: "payroll/salary/:id",
        element: <ProtectedRoute element={<SalarySetup />} allowedRoles={["admin"]} />,
      },
      {
        path: "payroll/generate",
        element: <ProtectedRoute element={<GeneratePayslip />} allowedRoles={["admin"]} />,
      },
      {
        path: "payroll/history",
        element: <ProtectedRoute element={<PayslipHistory />} allowedRoles={["admin"]} />,
      },
      {
        path: "payroll/settings",
        element: <ProtectedRoute element={<PayslipSettings />} allowedRoles={["admin"]} />,
      },
      {
        path: "payment/settings",
        element: <ProtectedRoute element={<PaymentSettings />} allowedRoles={["admin"]} />,
      },
    ],
  },

  // Student Routes (Student Only)
  {
    path: "/student",
    element: <ProtectedRoute element={<StudentLayout />} allowedRoles={["student"]} />,
    children: [
      {
        path: "dashboard",
        element: <ProtectedRoute element={<StudentDashboard />} allowedRoles={["student"]} />,
      },
      {
        path: "my-courses",
        element: <ProtectedRoute element={<MyCourses />} allowedRoles={["student"]} />,
      },
      {
        path: "my-internships",
        element: <ProtectedRoute element={<MyInternships />} allowedRoles={["student"]} />,
      },
      {
        path: "my-projects",
        element: <ProtectedRoute element={<MyProjects />} allowedRoles={["student"]} />,
      },
      {
        path: "pay",
        element: <ProtectedRoute element={<Pay />} allowedRoles={["student"]} />,
      },
      {
        path: "announcements",
        element: <ProtectedRoute element={<StudentAnnouncements />} allowedRoles={["student"]} />,
      },
      {
        path: "profile",
        element: <ProtectedRoute element={<StudentProfile />} allowedRoles={["student"]} />,
      },
      {
        path: "submit-project/:projectId",
        element: <ProtectedRoute element={<SubmitProject />} allowedRoles={["student"]} />,
      },
    ],
  },

  // Employee Routes
  {
    path: "/employee",
    element: <ProtectedRoute element={<Layout />} allowedRoles={["employee"]} />,
    children: [
      {
        path: "portal",
        element: <ProtectedRoute element={<EmployeePortal />} allowedRoles={["employee"]} />
      }
    ]
  },
]);

export default routes;

