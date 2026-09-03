import { useState } from "react";
import App_logo from "../icons/app_logo";
import Login_btn from "../components/login_btn";
import { useNavigate } from "react-router-dom";
import test_getpublickey from "../components/test_getpublickey";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [fundedBalance, setFundedBalance] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleConnect = async () => {
  setIsLoading(true);
  try {
    const { address, funded } = await test_getpublickey();
    setUserAddress(address);
    setFundedBalance(funded.balance);
    console.log("✅ Conectado, dirección:", address);
    console.log("💰 Fondos de prueba:", funded.balance, "XRP");
    setTimeout(() => {
      navigate("/home", { state: { address, balance: funded.balance } });
    }, 100);
  } catch (error) {
    console.error("❌ Error al conectar:", error);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden px-4">
      {/* Fondo geométrico (lo mantuve) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>

      {/* Efectos de luz (Blobs) animados - dan sensación de alta gama */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      {/* Tarjeta principal (Glassmorphism) */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl shadow-indigo-500/10">
        {/* Icono de nodo personalizado (reemplaza al "4") */}
        <App_logo />

        {/* Título con gradiente */}
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-center tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Room4-xrp
        </h1>

        {/* Subtítulo */}
        <p className="text-sm sm:text-base mb-8 text-center text-gray-300 max-w-xs">
          Conecta tu wallet XRPL y accede al mercado en segundos.
        </p>

        {/* Botón de conexión con estado de carga */}
        <Login_btn handleConnect={handleConnect} isLoading={isLoading} />

        {/* Indicador de seguridad (genera confianza) */}
        <div className="flex items-center gap-2 mt-6 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
          Conexión segura vía XRPL
        </div>

        {/* Línea divisoria sutil */}
        <div className="w-full h-px bg-white/10 my-6"></div>

        {/* Enlaces legales y copyright */}
        <div className="w-full flex flex-col sm:flex-col items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Términos
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Privacidad
            </a>
          </div>
          <span className="text-gray-600 text-sm sm:text-xs">
            © 2026 Room4-xrp. Todos los derechos reservados.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
