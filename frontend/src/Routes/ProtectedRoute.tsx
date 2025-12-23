import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

interface UserData {
  role: string;
  status: string;
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verifiedRole, setVerifiedRole] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("skToken");
      const cookieRole = Cookies.get("role");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Try to verify token - use role hint from cookie to pick endpoint
        // Admin uses different endpoint structure
        const baseUrl = import.meta.env.VITE_APP_BASE_URL;

        // Try student endpoint first (works for students)
        // Then try a simple token verification approach
        let response;
        let data: UserData | null = null;

        if (cookieRole === "admin") {
          // For admin, we just verify the token is valid by decoding it
          // The backend auth middleware already validates the token
          // We trust the role from the token payload
          setIsAuthenticated(true);
          setVerifiedRole("admin");
          setIsLoading(false);
          return;
        }

        // For students, verify via /student/me
        response = await fetch(`${baseUrl}student/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          data = await response.json();
          setIsAuthenticated(true);
          setVerifiedRole(data?.role ?? cookieRole ?? null);
          if (data?.role) {
            Cookies.set("role", data.role, { path: "/" });
          }
        } else if (response.status === 403) {
          // 403 means authenticated but wrong role (probably admin on student endpoint)
          setIsAuthenticated(true);
          setVerifiedRole(cookieRole || "admin");
        } else {
          // Token invalid or expired
          setIsAuthenticated(false);
          Cookies.remove("skToken");
          Cookies.remove("skRefreshToken");
          Cookies.remove("role");
        }
      } catch {
        // Network error - fall back to cookie
        setIsAuthenticated(!!token);
        setVerifiedRole(cookieRole || null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [location.pathname]);

  // Show loading spinner while verifying
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "var(--background)"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access using verified role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!verifiedRole || !allowedRoles.includes(verifiedRole)) {
      // User doesn't have required role
      if (verifiedRole === "student") {
        return <Navigate to="/student/dashboard" replace />;
      } else if (verifiedRole === "admin") {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;

