import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiClock, FiSettings, FiMenu, FiX } from "react-icons/fi";

import Resume from "../components/resume";
import ReciveComponent from "../components/recive_component";
import HistoryComponent from "../components/history_component";
import SettingsComponent from "../components/settings_component";
import HomeBackground from "../components/home_background";
import SideBar from "../components/side_bar";
import { API_BASE_URL } from "../utils/config";

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
  trustLines?: any[];
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

  if (!token) {
    navigate("/");
    return null;
  }

  const fetchBalances = async (walletsList: Wallet[]) => {
    const newBalances: Record<string, { xrp: number; rlusd: number }> = {};

    for (const wallet of walletsList) {
      try {
        const { getBalance } = await import("../utils/get_balance");
        const xrp = await getBalance(wallet.address);

        const rlusdRes = await fetch(
          `${API_BASE_URL}/balances/rlusd/${wallet.address}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const rlusdData = await rlusdRes.json();
        const rlusd = Number(rlusdData.balance) || 0;

        newBalances[wallet.address] = {
          xrp,
          rlusd,
        };
      } catch (error) {
        console.error(
          `Error al obtener balance para ${wallet.address}:`,
          error,
        );

        newBalances[wallet.address] = {
          xrp: 0,
          rlusd: 0,
        };
      }
    }

    setBalances(newBalances);
  };

  const fetchWallets = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/billeteras`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const activeWallets = data.data.filter(
          (w: Wallet) => w.is_active === true,
        );

        setWallets(activeWallets);
        await fetchBalances(activeWallets);
      } else {
        console.error("Error al obtener wallets:", data.message);
      }
    } catch (error) {
      console.error("Error de red al obtener wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const addWallet = async (address: string, name?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/billeteras`, {
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

      await fetchWallets();

      return true;
    } catch (error) {
      console.error("Error de red al agregar wallet:", error);
      return false;
    }
  };

  const createTrustLine = async (
    walletId: number,
    currency: string,
    issuer: string,
    limitAmount: number,
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trustlines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wallet_id: walletId,
          currency,
          issuer,
          limit_amount: limitAmount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await fetchWallets();
        return {
          success: true,
        };
      }

      return {
        success: false,
        message: data.message || "Error al crear trust line",
        code: response.status,
      };
    } catch (error) {
      console.error("Error de red al crear trust line:", error);

      return {
        success: false,
        message: "Error de conexión con el servidor",
        code: 500,
      };
    }
  };

  const deleteTrustLine = async (trustLineId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/trustlines/${trustLineId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        await fetchWallets();
        return true;
      }

      console.error("Error al eliminar trust line:", data.message);
      return false;
    } catch (error) {
      console.error("Error de red al eliminar trust line:", error);
      return false;
    }
  };

  const syncTrustLine = async (trustLineId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/trustlines/${trustLineId}/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        await fetchWallets();
        return data;
      }

      console.error("Error al sincronizar trust line:", data.message);
      return null;
    } catch (error) {
      console.error("Error de red al sincronizar trust line:", error);
      return null;
    }
  };

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
    {
      id: "dashboard",
      label: "Resumen",
      icon: FiHome,
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

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Resume
            wallets={wallets}
            balances={balances}
            loading={loading}
            onAddWallet={addWallet}
            onRefreshWallets={fetchWallets}
            onCreateTrustLine={createTrustLine}
            onDeleteTrustLine={deleteTrustLine}
            onSyncTrustLine={syncTrustLine}
          />
        );

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
