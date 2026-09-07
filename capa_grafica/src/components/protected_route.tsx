import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Verificar si existe la clave pública en sessionStorage
  const isAuthenticated = sessionStorage.getItem("xrplPublicKey") !== null;

  // Si no está autenticado, redirige al login
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
