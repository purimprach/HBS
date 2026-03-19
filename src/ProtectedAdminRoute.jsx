import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const token = sessionStorage.getItem("hbs_admin_token");
  const admin = sessionStorage.getItem("hbs_current_admin");

  if (!token || !admin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}