import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AdminAuthContext, UserAuthContext } from "../context/AuthProvider";
import BuffaloLoader from "./BuffaloLoader";

export const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { authAdmin, authAdminLoading } = useContext(AdminAuthContext);
  const adminToken = sessionStorage.getItem("adminToken");
  const adminRole = sessionStorage.getItem("adminRole");

  if (authAdminLoading) {
    return <BuffaloLoader variant="full" text="Verifying admin session..." />;
  }

  const isValidAdmin = Boolean(authAdmin && adminToken && adminRole === "admin");

  if (!isValidAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export const UserProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { authUser, authUserLoading } = useContext(UserAuthContext);
  const userToken = sessionStorage.getItem("userToken");
  const userRole = sessionStorage.getItem("userRole");

  if (authUserLoading) {
    return <BuffaloLoader variant="full" text="Verifying user session..." />;
  }

  const isValidUser = Boolean(authUser && userToken && userRole === "user");

  if (!isValidUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};
