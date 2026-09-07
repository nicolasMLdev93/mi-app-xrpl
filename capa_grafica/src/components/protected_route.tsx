import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // ✅ Buscar el token en localStorage
  const token = localStorage.getItem("token");
  console.log("🛡️ ProtectedRoute - Token:", token ? "✅ Existe" : "❌ No existe");

  // Si no hay token, redirigir al login (página principal)
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;