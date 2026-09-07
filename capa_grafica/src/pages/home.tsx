// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

type Tab = "dashboard" | "send" | "receive" | "history" | "settings";

// Tipo para una billetera (coincide con la respuesta de GET /api/billeteras)
interface Wallet {
  id: number;
  user_id: number;
  address: string;
  network: string;
  name: string | null;
  provider: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // =========================================
  // ESTADOS
  // =========================================
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Lista de billeteras del usuario
  const [wallets, setWallets] = useState<Wallet[]>([]);
  // Balances por billetera (clave: address, valor: { xrp, rlusd })
  const [balances, setBalances] = useState<Record<string, { xrp: number; rlusd: number }>>({});
  const [loading, setLoading] = useState(true);

  // =========================================
  // OBTENER BILLETERAS DESDE EL BACKEND
  // =========================================
  const fetchWallets = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/billeteras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setWallets(data.data);
      } else {
        console.error("Error al obtener wallets:", data.message);
      }
    } catch (error) {
      console.error("Error de red al obtener wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // OBTENER BALANCES PARA CADA BILLETERA
  // =========================================
  const fetchBalances = async () => {
    const newBalances: Record<string, { xrp: number; rlusd: number }> = {};
    for (const wallet of wallets) {
      try {
        // Importar funciones desde utils (asumiendo que existen)
        const { getBalance } = await import("../utils/get_balance");
        const { getRLUSDBalance } = await import("../utils/get_rlusd_balance");

        const xrp = await getBalance(wallet.address);
        const rlusd = await getRLUSDBalance(wallet.address);
        newBalances[wallet.address] = { xrp, rlusd };
      } catch (error) {
        console.error(`Error al obtener balance para ${wallet.address}:`, error);
        newBalances[wallet.address] = { xrp: 0, rlusd: 0 };
      }
    }
    setBalances(newBalances);
  };

  // Cargar wallets al montar y cuando se agregue una nueva
  /*
  useEffect(() => {
    fetchWallets();
  }, []);
  */
  /*
  // Cuando cambie la lista de wallets, actualizar balances
  useEffect(() => {
    if (wallets.length > 0) {
      fetchBalances();
    }
  }, [wallets]);
  */

  if (!token) {
    navigate("/");
    return null;
  }

  // =========================================
  // FUNCIÓN PARA AGREGAR NUEVA BILLETERA
  // (se pasa a Resume para que lo use al conectar)
  // =========================================
  const addWallet = async (address: string, name?: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/billeteras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          network: "XRP",
          name: name || "Mi billetera XRP",
          provider: "Manual",
          is_active: true,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Recargar la lista de wallets
        await fetchWallets();
        return true;
      } else {
        console.error("Error al agregar wallet:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error de red al agregar wallet:", error);
      return false;
    }
  };

  // =========================================
  // SIDEBAR RESPONSIVE
  // =========================================
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // =========================================
  // DATOS PARA SIDEBAR (tomamos la primera wallet si existe)
  // =========================================
  const firstWallet = wallets.length > 0 ? wallets[0] : null;
  const address = firstWallet?.address || "";
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Sin billetera";
  const balance = firstWallet ? balances[firstWallet.address]?.xrp || 0 : 0;

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
            wallets={wallets}
            balances={balances}
            loading={loading}
            onAddWallet={addWallet}
          />
        );
      case "send":
        return <SendComponent onBalanceUpdate={() => fetchBalances()} />;
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
  // RENDER
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
            setActiveTab(tab as Tab);
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