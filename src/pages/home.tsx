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
import { getRLUSDBalance } from "../utils/get_rlusd_balance";

type Tab = "dashboard" | "send" | "receive" | "history" | "settings";

type LocationState = {
  address?: string;
  balance?: number;
};

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================================
  // 1. OBTENER DATOS INICIALES
  // =========================================

  const locationState = location.state as LocationState | null;

  const storedAddress = sessionStorage.getItem("xrplPublicKey");

  const storedBalance = sessionStorage.getItem("xrplBalance");

  // =========================================
  // 2. ADDRESS
  // =========================================

  const [address, setAddress] = useState<string>(
    locationState?.address ?? storedAddress ?? "",
  );

  // =========================================
  // 3. BALANCE XRP
  // =========================================

  const [balance, setBalance] = useState<number>(
    locationState?.balance ?? (storedBalance ? Number(storedBalance) : 0),
  );

  // =========================================
  // 4. BALANCE RLUSD
  // =========================================

  const [rlusdBalance, setRlusdBalance] = useState<number>(0);

  // =========================================
  // 5. REFERENCIA DEL COMPONENTE
  // =========================================

  const isMounted = useRef(true);

  // =========================================
  // 6. ACTUALIZAR BALANCE XRP
  // =========================================

  const refreshBalance = async () => {
    if (!address || !isMounted.current) {
      return;
    }

    try {
      const newBalance = await getBalance(address);

      if (isMounted.current) {
        setBalance(newBalance);

        sessionStorage.setItem("xrplBalance", String(newBalance));

        console.log("💰 Balance XRP actualizado:", newBalance, "XRP");
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("❌ Error al obtener balance XRP:", error);

        // Conservamos el balance anterior.
      }
    }
  };

  // =========================================
  // 7. ACTUALIZAR BALANCE RLUSD
  // =========================================

  const refreshRLUSDBalance = async () => {
    if (!address || !isMounted.current) {
      return;
    }

    try {
      const newBalance = await getRLUSDBalance(address);

      if (isMounted.current) {
        setRlusdBalance(newBalance);

        console.log("💵 Balance RLUSD actualizado:", newBalance, "RLUSD");
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("❌ Error al obtener balance RLUSD:", error);

        // Conservamos el balance anterior.
      }
    }
  };

  // =========================================
  // 8. ACTUALIZAR LOS BALANCES AL ENTRAR
  // =========================================

  useEffect(() => {
    isMounted.current = true;

    const refreshTimeout = window.setTimeout(() => {
      void refreshBalance();

      void refreshRLUSDBalance();
    }, 0);

    return () => {
      window.clearTimeout(refreshTimeout);

      isMounted.current = false;
    };
  }, [address]);

  // =========================================
  // 9. GUARDAR ADDRESS EN SESSION STORAGE
  // =========================================

  useEffect(() => {
    if (address) {
      sessionStorage.setItem("xrplPublicKey", address);
    }
  }, [address]);

  // =========================================
  // 10. REDIRIGIR SI NO HAY ADDRESS
  // =========================================

  useEffect(() => {
    if (!address) {
      navigate("/");
    }
  }, [address, navigate]);

  // =========================================
  // 11. SIDEBAR RESPONSIVE
  // =========================================

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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // =========================================
  // 12. CARGANDO
  // =========================================

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg animate-pulse">
          Cargando datos de la wallet...
        </div>
      </div>
    );
  }

  // =========================================
  // 13. DIRECCIÓN CORTA
  // =========================================

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  // =========================================
  // 14. MENÚ
  // =========================================

  const menuItems = [
    {
      id: "dashboard",
      label: "Resumen",
      icon: FiHome,
    },
    {
      id: "send",
      label: "Enviar",
      icon: FiSend,
    },
    {
      id: "receive",
      label: "Recibir",
      icon: FiDownload,
    },
    {
      id: "history",
      label: "Historial",
      icon: FiClock,
    },
    {
      id: "settings",
      label: "Ajustes",
      icon: FiSettings,
    },
  ];

  // =========================================
  // 15. CONTENIDO
  // =========================================

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Resume
            address={address}
            shortAddress={shortAddress}
            balance={balance}
            rlusdBalance={rlusdBalance}
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

  // =========================================
  // 16. RENDER
  // =========================================

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
        {sidebarOpen ? (
          <FiX className="text-xl" />
        ) : (
          <FiMenu className="text-xl" />
        )}
      </button>

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        } p-6 md:p-8 relative z-10 min-h-screen`}
      >
        <div className="max-w-4xl mx-auto pt-12 md:pt-0">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Home;
