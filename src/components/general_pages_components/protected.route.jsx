import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

export default function ProtectedRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${backendUrl}/auth/status`, {
      credentials: 'include',
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/not-authorized');
        }
      })
      .catch(err => {
        console.error('Error verificando autenticación:', err);
        navigate('/not-authorized');
      });
  }, [navigate]);

  return <Outlet />;
}