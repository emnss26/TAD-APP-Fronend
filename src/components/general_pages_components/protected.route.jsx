import React from "react";
import { useCookies } from "react-cookie";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const [cookies] = useCookies(["access_token"]);
  const { search } = useLocation();
  const token = new URLSearchParams(search).get("token");

  // si ya hay cookie *o* viene token en la URL, dejamos pasar
  if (cookies.access_token || token) {
    return <Outlet />;
  }

  return <Navigate to="/not-authorized" replace />;
};

export default ProtectedRoute;