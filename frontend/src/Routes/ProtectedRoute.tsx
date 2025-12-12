import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = Cookies.get("skToken");
    return !!token;
  });

  const userRole = Cookies.get("role");

  useEffect(() => {
    const handleStorageChange = () => {
      const token = Cookies.get("skToken");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role
      if (userRole === "student") {
        // Student trying to access admin routes
        return <Navigate to="/student/dashboard" replace />;
      } else if (userRole === "admin") {
        // Admin trying to access student routes
        return <Navigate to="/dashboard" replace />;
      }
      // Unknown role - redirect to login
      return <Navigate to="/login" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
