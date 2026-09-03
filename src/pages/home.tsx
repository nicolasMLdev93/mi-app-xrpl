import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSend,
  FiDownload,
  FiClock,
  FiSettings,
  FiMenu,
  FiX,
} from "react-icons/fi";
import Resume from "../components/resume";
import SendComponent from "../components/send_component";
import ReciveComponent from "../components/recive_component";
import HistoryComponent from "../components/history_component";
import SettingsComponent from "../components/settings_component";
import HomeBackground from "../components/home_background";
import SideBar from "../components/side_bar";
import { getBalance } from "../utils/get_balance";

type Tab = "dashboard" | "send" | "receive" | "history" | "settings";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estado local
  const [address, setAddress] = useState<string>(
    sessionStorage.getItem("xrplPublicKey") ||
      (location.state as { address?: string })?.address ||
      ""
  );
  const [balance, setBalance] = useState<number>(
    Number(sessionStorage.getItem("xrplBalance")) ||
      (location.state as { balance?: number })?.balance ||
      0
  );

  // Referencia para saber si el componente está montado
  const isMounted = useRef(true);

  const refreshBalance = async () => {
    if (!address || !isMounted.current) return;
    try {
      const newBalance = await getBalance(address);
      if (isMounted.current) {
        setBalance(newBalance);
        sessionStorage.setItem("xrplBalance", String(newBalance));
        console.log("💰 Balance actualizado:", newBalance, "XRP");
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("❌ Error al obtener balance:", error);
        // Mantener el balance anterior, no actualizar
      }
    }
  };

  // Al montar, refrescar balance
  useEffect(() => {
    isMounted.current = true;
    refreshBalance();
    return () => {
      isMounted.current = false;
    };
  }, []); // Solo una vez

  // Redirigir si no hay dirección
  useEffect(() => {
    if (!address) {
      navigate("/");
    }
  }, [address, navigate]);

  // Sidebar responsive
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

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg animate-pulse">
          Cargando datos de la wallet...
        </div>
      </div>
    );
  }

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
          <Resume
            address={address}
            shortAddress={shortAddress}
            balance={balance}
          />
        );
      case "send":
        return <SendComponent onBalanceUpdate={refreshBalance} />;
      case "receive":
        return <ReciveComponent address={address} />;
      case "history":
        return <HistoryComponent />;
      case "settings":
        return <SettingsComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      <HomeBackground />

      <SideBar
        sidebarOpen={sidebarOpen}
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          if (
            tab === "dashboard" ||
            tab === "send" ||
            tab === "receive" ||
            tab === "history" ||
            tab === "settings"
          ) {
            setActiveTab(tab);
          }
        }}
        address={address}
        shortAddress={shortAddress}
        balance={balance}
        navigate={navigate}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
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