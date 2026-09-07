import { useNavigate } from "react-router-dom";
import App_logo from "../icons/app_logo";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden px-4">
      {/* Fondos y efectos (igual que antes) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      {/* Tarjeta principal */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl shadow-indigo-500/10">
        <App_logo />

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-center tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Room4-xrp
        </h1>

        <p className="text-sm sm:text-base mb-8 text-center text-gray-300 max-w-xs">
          Accede a tu cuenta para gestionar tus billeteras XRP.
        </p>

        {/* ====================================
            BOTONES DE AUTENTICACIÓN
            ==================================== */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 text-white font-semibold shadow-lg shadow-indigo-500/30"
          >
            Iniciar sesión
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 rounded-xl bg-transparent border border-white/20 hover:bg-white/10 active:scale-[0.98] transition-all duration-200 text-white font-semibold"
          >
            Crear cuenta
          </button>
        </div>

        <div className="flex items-center gap-2 mt-6 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
          Conexión segura
        </div>

        <div className="w-full h-px bg-white/10 my-6"></div>

        <div className="w-full flex flex-col items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Privacidad
            </a>
          </div>
          <span className="text-gray-600">© 2026 Room4-xrp.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;