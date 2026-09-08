// src/components/Resume.tsx
import { useState } from "react";
import { getXamanWallets } from "../utils/getXamanWallets";

interface Wallet {
  id: number;
  address: string;
  name: string | null;
  network: string;
  is_active: boolean;
}

interface ResumeProps {
  wallets: Wallet[];
  balances: Record<string, { xrp: number; rlusd: number }>;
  loading: boolean;
  onAddWallet: (address: string, name?: string) => Promise<boolean>;
}

const Resume = ({ wallets, balances, loading, onAddWallet }: ResumeProps) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [walletName, setWalletName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  //  CONECTAR CON XAMAN (MÚLTIPLES WALLETS)
  // =========================================
  const handleConnectXaman = async () => {
    setIsConnecting(true);
    setError("");

    try {
      const xamanWallets = await getXamanWallets();
      if (xamanWallets.length === 0) {
        setError("No se obtuvieron billeteras desde Xaman.");
        return;
      }

      let successCount = 0;
      for (const wallet of xamanWallets) {
        const added = await onAddWallet(wallet.address, wallet.name || "Wallet Xaman");
        if (added) successCount++;
      }

      if (successCount === 0) {
        setError("No se pudo agregar ninguna billetera.");
      } else {
        setShowModal(false);
        setNewAddress("");
        setWalletName("");
        console.log(`✅ ${successCount} billetera(s) agregada(s) exitosamente.`);
      }
    } catch (err) {
      console.error("Error al conectar con Xaman:", err);
      setError("Error al conectar con Xaman.");
    } finally {
      setIsConnecting(false);
    }
  };

  // =========================================
  //  CONECTAR MANUAL (modal)
  // =========================================
  const handleConnectManual = async () => {
    const trimmedAddress = newAddress.trim();
    if (!trimmedAddress) {
      setError("La dirección es obligatoria");
      return;
    }
    if (!/^r[0-9a-zA-Z]{33,34}$/.test(trimmedAddress)) {
      setError("Dirección XRP inválida. Debe comenzar con 'r' y tener ~34 caracteres.");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      const success = await onAddWallet(trimmedAddress, walletName.trim() || undefined);
      if (success) {
        setShowModal(false);
        setNewAddress("");
        setWalletName("");
      } else {
        setError("No se pudo agregar la billetera.");
      }
    } catch (err) {
      console.error("Error al conectar manual:", err);
      setError("Error al conectar la billetera.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Formatear dirección corta
  const shortAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const greeting = user ? `Hola, ${user.username}` : "Hola";

  return (
    <div className="space-y-6">
      {/* Título con saludo */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {greeting}
        </h2>
        <p className="text-gray-400 text-sm">Tus billeteras XRP conectadas</p>
      </div>

      {/* Lista de wallets */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p>Cargando balances...</p>
        </div>
      ) : wallets.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <p className="text-gray-400">No tienes billeteras conectadas.</p>
          <p className="text-sm text-gray-500 mt-1">Agrega una usando el botón de abajo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wallets.map((wallet) => {
            const bal = balances[wallet.address] || { xrp: 0, rlusd: 0 };
            return (
              <div
                key={wallet.id}
                className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block"></span>
                      <span className="font-semibold text-white">
                        {wallet.name || "Wallet sin nombre"}
                      </span>
                      {!wallet.is_active && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                          inactiva
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm text-gray-400 mt-1">
                      {shortAddress(wallet.address)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className="text-sm font-medium text-green-400">
                      {bal.xrp.toFixed(4)} XRP
                    </div>
                    <div className="text-sm font-medium text-blue-400">
                      {bal.rlusd.toFixed(4)} RLUSD
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botones para conectar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleConnectXaman}
          disabled={isConnecting}
          className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Conectando...
            </>
          ) : (
            <>
              <span className="text-xl">🔗</span> Conectar con Xaman
            </>
          )}
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-dashed border-white/20 hover:bg-white/10 hover:border-indigo-500/50 transition-all text-gray-300 font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> Ingresar dirección manual
        </button>
      </div>

      {/* Modal para dirección manual */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Conectar nueva wallet</h3>
            <p className="text-sm text-gray-400 mb-4">Ingresa la dirección XRP que deseas agregar a tu cuenta.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-3"
              autoFocus
            />
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Nombre (opcional)"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-4"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConnectManual}
                disabled={isConnecting}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Conectando...
                  </>
                ) : (
                  "Conectar"
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl text-white font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resume;