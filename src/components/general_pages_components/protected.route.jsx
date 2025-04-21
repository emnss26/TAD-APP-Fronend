import React from 'react';
import { useCookies } from 'react-cookie';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const [cookies] = useCookies(['access_token']);


  if (!cookies.access_token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;