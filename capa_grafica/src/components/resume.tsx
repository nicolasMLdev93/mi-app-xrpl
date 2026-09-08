// src/components/Resume.tsx
import { useState, useEffect } from "react";
import { getXamanWallets } from "../utils/getXamanWallets";
import { API_BASE_URL } from "../utils/config";
import { FiSettings, FiX } from "react-icons/fi";

// Constantes para RLUSD (Testnet)
const RLUSD_CURRENCY = "RLUSD";
const RLUSD_ISSUER = "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV";

interface TrustLine {
  id: number;
  wallet_id: number;
  currency: string;
  issuer: string;
  limit_amount: number;
  balance: number;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

interface Wallet {
  id: number;
  address: string;
  name: string | null;
  network: string;
  is_active: boolean;
  trustLines?: TrustLine[];
}

interface ResumeProps {
  wallets: Wallet[];
  balances: Record<string, { xrp: number; rlusd: number }>;
  loading: boolean;
  onAddWallet: (address: string, name?: string) => Promise<boolean>;
  onRefreshWallets: () => void;
  onCreateTrustLine: (walletId: number, currency: string, issuer: string, limitAmount: number) => Promise<boolean>;
  onDeleteTrustLine: (trustLineId: number) => Promise<boolean>;
  onSyncTrustLine: (trustLineId: number) => Promise<any>;
}

const Resume = ({
  wallets,
  balances,
  loading,
  onAddWallet,
  onRefreshWallets,
  onCreateTrustLine,
  onDeleteTrustLine,
  onSyncTrustLine,
}: ResumeProps) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Estados generales
  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [walletName, setWalletName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para Trust Lines
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [newLimitAmount, setNewLimitAmount] = useState(1000000);

  // Estados para el modal de gestión
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTrustLine, setSelectedTrustLine] = useState<TrustLine | null>(null);

  // Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

  // Estados de carga para botones
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auto-desaparecer mensaje de éxito
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // =========================================
  // ABRIR MODAL DE GESTIÓN
  // =========================================
  const openManageModal = (trustLine: TrustLine) => {
    setSelectedTrustLine(trustLine);
    setShowManageModal(true);
    setError(null);
    setSuccess(null);
  };

  // =========================================
  // CONECTAR CON XAMAN (CON VERIFICACIÓN DE DUPLICADOS)
  // =========================================
  const handleConnectXaman = async () => {
    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const xamanWallets = await getXamanWallets();
      if (xamanWallets.length === 0) {
        setError("No se obtuvieron billeteras desde Xaman.");
        return;
      }

      // 🔥 Verificar qué direcciones ya existen en la lista actual
      const existingAddresses = new Set(wallets.map(w => w.address));
      let addedCount = 0;
      let skippedCount = 0;

      for (const wallet of xamanWallets) {
        if (existingAddresses.has(wallet.address)) {
          skippedCount++;
          continue;
        }
        const added = await onAddWallet(wallet.address, wallet.name || "Wallet Xaman");
        if (added) addedCount++;
      }

      if (addedCount === 0 && skippedCount > 0) {
        setSuccess(`✅ Todas las billeteras ya están conectadas. (${skippedCount} wallet(s))`);
        onRefreshWallets();
      } else if (addedCount > 0) {
        setSuccess(`✅ ${addedCount} billetera(s) agregada(s) exitosamente. (${skippedCount} ya existían)`);
        setShowModal(false);
        setNewAddress("");
        setWalletName("");
        onRefreshWallets();
      } else {
        setError("No se pudo agregar ninguna billetera.");
      }
    } catch (err) {
      console.error("Error al conectar con Xaman:", err);
      setError("Error al conectar con Xaman.");
    } finally {
      setIsConnecting(false);
    }
  };

  // =========================================
  // CONECTAR MANUAL
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
    setError(null);
    setSuccess(null);

    try {
      const success = await onAddWallet(trimmedAddress, walletName.trim() || undefined);
      if (success) {
        setShowModal(false);
        setNewAddress("");
        setWalletName("");
        setSuccess("✅ Billetera agregada exitosamente.");
        onRefreshWallets();
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

  // =========================================
  // ELIMINAR TRUST LINE (con modal de confirmación)
  // =========================================
  const handleDeleteTrustLine = async () => {
    if (!selectedTrustLine) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const deleted = await onDeleteTrustLine(selectedTrustLine.id);
      if (deleted) {
        setSuccess(`✅ Trust Line de ${selectedTrustLine.currency} eliminado correctamente`);
        setShowManageModal(false);
        setSelectedTrustLine(null);
        onRefreshWallets();
      } else {
        setError("Error al eliminar Trust Line");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      setError("Error al eliminar Trust Line");
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  // =========================================
  // SINCRONIZAR TRUST LINE
  // =========================================
  const handleSyncTrustLine = async () => {
    if (!selectedTrustLine) return;

    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSyncTrustLine(selectedTrustLine.id);
      if (result && result.success) {
        setSuccess(`✅ Trust Line sincronizado correctamente. Balance: ${result.realBalance || 0} RLUSD`);
        if (result.data) {
          setSelectedTrustLine({ ...selectedTrustLine, balance: result.data.balance });
        }
        onRefreshWallets();
      } else {
        setError(result?.message || "Error al sincronizar");
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
      setError("Error al sincronizar Trust Line");
    } finally {
      setSyncing(false);
    }
  };

  // =========================================
  // CREAR TRUST LINE (SOLO RLUSD)
  // =========================================
  const handleCreateTrustLine = async () => {
    const currency = RLUSD_CURRENCY;
    const issuer = RLUSD_ISSUER;

    if (!selectedWalletId) {
      setError("Selecciona una wallet primero");
      return;
    }
    if (newLimitAmount <= 0) {
      setError("El límite debe ser mayor a 0");
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await onCreateTrustLine(selectedWalletId, currency, issuer, newLimitAmount);
      if (created) {
        setSuccess(`✅ Trust Line RLUSD creado exitosamente. Límite: ${newLimitAmount}`);
        setShowCreateModal(false);
        setNewLimitAmount(1000000);
        setSelectedWalletId(null);
        onRefreshWallets();
      } else {
        setError("Error al crear Trust Line. Verifica que la wallet tenga XRP para la comisión.");
      }
    } catch (error) {
      console.error("Error al crear:", error);
      setError("Error al crear Trust Line. Intenta de nuevo.");
    } finally {
      setIsConnecting(false);
    }
  };

  // =========================================
  // ABRIR CONFIRMACIÓN PARA ELIMINAR
  // =========================================
  const openConfirmDelete = () => {
    setConfirmMessage(`¿Estás seguro de que quieres eliminar el Trust Line de ${selectedTrustLine?.currency}?`);
    setConfirmAction(() => handleDeleteTrustLine);
    setShowConfirmModal(true);
  };

  const shortAddress = (addr: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");
  const greeting = user ? `Hola, ${user.username}` : "Hola";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {greeting}
        </h2>
        <p className="text-gray-400 text-sm">Tus billeteras XRP activas</p>
      </div>

      {error && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="w-full p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p>Cargando balances...</p>
        </div>
      ) : wallets.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <p className="text-gray-400">No tienes billeteras activas.</p>
          <p className="text-sm text-gray-500 mt-1">Agrega una usando los botones de abajo.</p>
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

                {/* Trust Lines */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Trust Lines</p>
                    <button
                      onClick={() => {
                        setSelectedWalletId(wallet.id);
                        setShowCreateModal(true);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      + Crear
                    </button>
                  </div>

                  {wallet.trustLines && wallet.trustLines.length > 0 ? (
                    wallet.trustLines.map((tl) => (
                      <div
                        key={tl.id}
                        className="bg-white/5 rounded-lg p-2 mt-2 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs text-gray-300">
                            {tl.currency} (emisor: {tl.issuer.slice(0, 6)}...)
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            Límite: {tl.limit_amount} | Balance: {tl.balance}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                              tl.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : tl.status === "inactive"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {tl.status}
                          </span>
                        </div>
                        <button
                          onClick={() => openManageModal(tl)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          title="Gestionar Trust Line"
                        >
                          <FiSettings className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">No hay Trust Lines activos</p>
                  )}
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
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
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
            <p className="text-sm text-gray-400 mb-4">
              Ingresa la dirección XRP que deseas agregar.
            </p>

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
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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

      {/* Modal para crear Trust Line */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md backdrop-blur-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">🔗 Crear Trust Line RLUSD</h3>
            <p className="text-sm text-gray-400 mb-4">
              Crea un Trust Line para recibir RLUSD en esta billetera.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-gray-400">Token</p>
                <p className="text-white font-medium">RLUSD (Testnet)</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-gray-400">Emisor</p>
                <p className="text-white font-mono text-sm break-all">
                  rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Límite <span className="text-xs text-gray-500">(Limit Amount)</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newLimitAmount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (e.target.value === "" || val > 0) {
                      setNewLimitAmount(val || 0);
                    } else {
                      setError("El límite debe ser mayor a 0");
                    }
                  }}
                  placeholder="1000000"
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad máxima de RLUSD que deseas aceptar (debe ser mayor a 0).
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-gray-400">Wallet seleccionada:</p>
                <p className="text-sm text-white font-medium">
                  {selectedWalletId
                    ? wallets.find((w) => w.id === selectedWalletId)?.name ||
                      `ID: ${selectedWalletId}`
                    : "No seleccionada"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleCreateTrustLine}
                disabled={isConnecting}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creando...
                  </>
                ) : (
                  "Crear Trust Line"
                )}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl text-white font-semibold"
              >
                Cancelar
              </button>
            </div>

            <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-xs text-indigo-300">
                ⚠️ Necesitas al menos ~0.000012 XRP en tu wallet para pagar la comisión de la
                transacción.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Trust Line (sin cambiar límite) */}
      {showManageModal && selectedTrustLine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowManageModal(false)}
        >
          <div
            className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">🔧 Gestionar Trust Line</h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del Trust Line */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Moneda</span>
                  <span className="text-sm text-white font-medium">{selectedTrustLine.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Emisor</span>
                  <span className="text-sm text-white font-mono">
                    {selectedTrustLine.issuer.slice(0, 6)}...{selectedTrustLine.issuer.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Límite</span>
                  <span className="text-sm text-blue-400 font-medium">
                    {selectedTrustLine.limit_amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Balance</span>
                  <span className="text-sm text-green-400 font-medium">
                    {selectedTrustLine.balance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Estado</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedTrustLine.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : selectedTrustLine.status === "inactive"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {selectedTrustLine.status}
                  </span>
                </div>
              </div>

              {/* Solo acciones: Sincronizar y Eliminar */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleSyncTrustLine}
                  disabled={syncing}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium disabled:opacity-50"
                >
                  {syncing ? "Sincronizando..." : "🔄 Sincronizar balance"}
                </button>
                <button
                  onClick={openConfirmDelete}
                  disabled={deleting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium disabled:opacity-50"
                >
                  {deleting ? "Eliminando..." : "🗑️ Eliminar Trust Line"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">⚠️ Confirmar eliminación</h3>
            <p className="text-sm text-gray-300 mb-4">{confirmMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium"
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