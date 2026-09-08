// src/pages/Home.tsx
import { useEffect, useState, useRef } from "react";
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
import createRLUSDTrustline from "../utils/create_rlusd_trustline";
import simulatedWallet from "../utils/simulated_wallet";
import { getRLUSDBalance } from "../utils/get_rlusd_balance";

type Tab = "dashboard" | "send" | "receive" | "history" | "settings";

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

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [balances, setBalances] = useState<
    Record<string, { xrp: number; rlusd: number }>
  >({});
  const [loading, setLoading] = useState(true);

  // Set para rastrear wallets nuevas (para simular RLUSD)
  const newWalletsRef = useRef<Set<string>>(new Set());

  if (!token) {
    navigate("/");
    return null;
  }

  // =========================================
  // OBTENER BALANCES (recibe lista de wallets)
  // =========================================
  const fetchBalances = async (walletsList: Wallet[]) => {
    const newBalances: Record<string, { xrp: number; rlusd: number }> = {};

    for (const wallet of walletsList) {
      try {
        const { getBalance } = await import("../utils/get_balance");
        const xrp = await getBalance(wallet.address);

        // Consultar RLUSD real
        let rlusd = await getRLUSDBalance(wallet.address);

        // Si es una wallet nueva y no tiene RLUSD, asignamos 10 para prueba
        if (newWalletsRef.current.has(wallet.address) && rlusd === 0) {
          rlusd = 10;
          console.log(`🎯 Simulando 10 RLUSD para wallet nueva: ${wallet.address}`);
        }

        newBalances[wallet.address] = { xrp, rlusd };
      } catch (error) {
        console.error(`Error al obtener balance para ${wallet.address}:`, error);
        newBalances[wallet.address] = { xrp: 0, rlusd: 0 };
      }
    }

    setBalances(newBalances);
  };

  // =========================================
  // OBTENER WALLETS Y LUEGO BALANCES
  // =========================================
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/billeteras", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setWallets(data.data);
        // Cargar balances de esas wallets y esperar a que termine
        await fetchBalances(data.data);
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
  // EFECTOS
  // =========================================
  useEffect(() => {
    fetchWallets();
  }, []);

  // =========================================
  // FUNCIÓN PARA AGREGAR NUEVA BILLETERA
  // =========================================
  const addWallet = async (address: string, name?: string) => {
    try {
      // 1. Guardar wallet en el backend
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
      if (!data.success) {
        console.error("Error al agregar wallet:", data.message);
        return false;
      }

      // 2. Marcar como nueva para simular RLUSD
      newWalletsRef.current.add(address);

      // 3. Crear Trust Line de RLUSD (usando la wallet simulada)
      try {
        const walletInstance = simulatedWallet.getWallet();
        if (walletInstance && walletInstance.classicAddress === address) {
          const result = await createRLUSDTrustline(
            address,
            async (tx) => {
              const signed = await simulatedWallet.signTransaction(tx);
              return { tx_blob: signed.tx_blob, hash: signed.hash };
            }
          );
          if (result.success) {
            console.log("✅ Trust Line RLUSD creado exitosamente");
          } else {
            console.warn("⚠️ No se pudo crear Trust Line RLUSD:", result.error);
          }
        } else {
          console.log("ℹ️ Para wallets manuales, debes crear el Trust Line manualmente en https://tryrlusd.com/");
        }
      } catch (error) {
        console.error("❌ Error al crear Trust Line:", error);
      }

      // 4. Recargar la lista de wallets (incluye balances)
      await fetchWallets();
      return true;
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

  const firstWallet = wallets.length > 0 ? wallets[0] : null;
  const address = firstWallet?.address || "";
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Sin billetera";
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
        return <SendComponent onBalanceUpdate={() => fetchBalances(wallets)} />;
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