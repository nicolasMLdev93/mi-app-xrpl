import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import App_logo from "../icons/app_logo";
import { 
  FiHome, 
  FiSend, 
  FiDownload, 
  FiClock, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";

type Tab = "dashboard" | "send" | "receive" | "history" | "settings";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { address, balance } = (location.state as
    | { address: string; balance: number }
    | undefined) ?? { address: null, balance: null };

  useEffect(() => {
    if (!address && balance === null) {
      navigate("/");
    } else {
      setLoading(false);
    }
  }, [address, balance, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg animate-pulse">
          Cargando datos de la wallet...
        </div>
      </div>
    );
  }

  if (!address) return null;

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const menuItems = [
    { id: "dashboard", label: "Resumen", icon: FiHome },
    { id: "send", label: "Enviar", icon: FiSend },
    { id: "receive", label: "Recibir", icon: FiDownload },
    { id: "history", label: "Historial", icon: FiClock },
    { id: "settings", label: "Ajustes", icon: FiSettings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Resumen de la cuenta
              </h2>
              <p className="text-gray-400 text-sm">Vista general de tu wallet XRPL</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Dirección</div>
                <div className="font-mono text-sm text-gray-200 break-all mt-1">{address}</div>
                <div className="text-xs text-gray-500 mt-1">{shortAddress}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Balance</div>
                <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                  {balance?.toLocaleString() ?? "0"} XRP
                </div>
                <div className="text-xs text-gray-500 mt-1">Fondos de prueba (Testnet)</div>
              </div>
            </div>
          </div>
        );
      case "send":
        return (
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Enviar XRP
            </h2>
            <p className="text-gray-400 text-sm mb-4">Transfiere fondos a otra cuenta</p>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <input
                type="text"
                placeholder="Dirección destino (r...)"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <input
                type="number"
                placeholder="Cantidad en XRP"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <button className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity">
                Enviar (demo)
              </button>
            </div>
          </div>
        );
      case "receive":
        return (
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Recibir XRP
            </h2>
            <p className="text-gray-400 text-sm mb-4">Comparte tu dirección para recibir fondos</p>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="font-mono text-sm text-gray-200 break-all bg-black/30 p-3 rounded-lg border border-white/10">
                {address}
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(address)}
                className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
              >
                📋 Copiar dirección
              </button>
            </div>
          </div>
        );
      case "history":
        return (
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Historial
            </h2>
            <p className="text-gray-400 text-sm mb-4">Registro de transacciones</p>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-gray-300 text-sm">No hay transacciones recientes en Testnet.</div>
              <div className="text-xs text-gray-500 mt-1">* Próximamente con integración real.</div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Ajustes
            </h2>
            <p className="text-gray-400 text-sm mb-4">Configuración de la aplicación</p>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Modo oscuro</span>
                <span className="text-xs text-gray-500">(siempre activo)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Red actual</span>
                <span className="text-xs text-indigo-400 font-mono">Testnet</span>
              </div>
              <button className="w-full mt-2 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors">
                Resetear aplicación
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      {/* Fondo con burbujas tenues y en movimiento */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Textura de cubos (sutil) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        {/* Burbujas animadas con baja opacidad */}
        <div className="absolute inset-0">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
          <div className="bubble bubble-4"></div>
          <div className="bubble bubble-5"></div>
        </div>

        {/* Estilos de las burbujas */}
        <style>{`
          .bubble {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.15;
            animation: float 20s ease-in-out infinite alternate;
          }
          .bubble-1 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle at 30% 30%, #818cf8, #7c3aed);
            top: -5%;
            left: -5%;
            animation-duration: 22s;
            animation-delay: 0s;
          }
          .bubble-2 {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle at 70% 30%, #a78bfa, #6d28d9);
            bottom: -10%;
            right: -5%;
            animation-duration: 26s;
            animation-delay: -3s;
          }
          .bubble-3 {
            width: 250px;
            height: 250px;
            background: radial-gradient(circle at 60% 60%, #f472b6, #db2777);
            top: 30%;
            left: 40%;
            animation-duration: 28s;
            animation-delay: -6s;
          }
          .bubble-4 {
            width: 200px;
            height: 200px;
            background: radial-gradient(circle at 20% 80%, #34d399, #059669);
            bottom: 20%;
            left: 10%;
            animation-duration: 24s;
            animation-delay: -2s;
          }
          .bubble-5 {
            width: 350px;
            height: 350px;
            background: radial-gradient(circle at 80% 80%, #60a5fa, #2563eb);
            top: -15%;
            right: 20%;
            animation-duration: 30s;
            animation-delay: -8s;
          }
          @keyframes float {
            0% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            33% {
              transform: translate(30px, -40px) scale(1.1) rotate(5deg);
            }
            66% {
              transform: translate(-20px, 30px) scale(0.9) rotate(-3deg);
            }
            100% {
              transform: translate(40px, 20px) scale(1.05) rotate(4deg);
            }
          }
        `}</style>
      </div>

      {/* Sidebar (igual que antes) */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-indigo-500/20 flex flex-col`}
      >
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
          <App_logo />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Room4-xrp
          </span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white shadow-lg shadow-indigo-500/10 border border-indigo-400/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="text-xl" />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {address?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-300 truncate">{shortAddress}</div>
              <div className="text-[10px] text-gray-500">{balance?.toFixed(2)} XRP</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300 border border-white/10"
          >
            <FiLogOut />
            Desconectar
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors md:hidden"
      >
        {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
      </button>

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        } p-6 md:p-8 relative z-10 min-h-screen`}
      >
        <div className="max-w-4xl mx-auto pt-12 md:pt-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Home;