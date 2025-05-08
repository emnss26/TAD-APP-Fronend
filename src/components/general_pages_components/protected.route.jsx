import React from "react";
import { useCookies } from "react-cookie";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const [cookies] = useCookies(["access_token"]);
  return cookies.access_token
    ? <Outlet />
    : <Navigate to="/" replace />;
};

export default ProtectedRoute;
