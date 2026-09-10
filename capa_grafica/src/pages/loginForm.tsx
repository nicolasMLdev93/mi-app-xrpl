import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import App_logo from "../icons/app_logo";
import Spinner from "../components/spinner";
import { API_BASE_URL } from "../utils/config";
import { FiEye, FiEyeOff } from "react-icons/fi"; // ← Importa los iconos

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ← Estado para el ojo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log("📦 Respuesta del backend:", data);

      if (response.ok) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        console.log("🔐 Token guardado:", localStorage.getItem("token"));

        try {
          navigate("/home", { replace: true });
          console.log("✅ Redirección con navigate ejecutada");
        } catch (navError) {
          console.warn("⚠️ Falló navigate, usando fallback:", navError);
          window.location.href = "/home";
        }
      } else {
        setError(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      console.error("❌ Error de red:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden px-4">
      {/* Fondos y efectos decorativos */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      {/* Tarjeta de login */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl shadow-indigo-500/10">
        <App_logo />
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-center tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Iniciar sesión
        </h1>
        <p className="text-sm sm:text-base mb-6 text-center text-gray-300">
          Ingresa a tu cuenta para gestionar tus billeteras XRP.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pr-12 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 text-white font-semibold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner />
                Iniciando sesión...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <div className="w-full h-px bg-white/10 my-6"></div>
        <p className="text-sm text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Regístrate
          </Link>
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
          Conexión segura
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
