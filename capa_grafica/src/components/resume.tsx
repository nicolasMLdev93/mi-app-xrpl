// src/components/Resume.tsx
import { useState, useEffect } from "react";
import { getXamanWallets } from "../utils/getXamanWallets";
import { FiSettings, FiX } from "react-icons/fi";
import { RLUSD_CURRENCY, RLUSD_ISSUER } from "../utils/config";
import SendComponent from "./send_component";
import ReciveComponent from "./recive_component";
import { jsPDF } from "jspdf";

// ============================================================
// Helper para mostrar nombre legible del token
// ============================================================

const getCurrencyDisplay = (currencyHex: string): string => {
  if (currencyHex === RLUSD_CURRENCY) return "RLUSD";
  return currencyHex;
};

// ============================================================
// Interfaces
// ============================================================

interface TrustLine {
  id: number;
  wallet_id: number;
  currency: string;
  issuer: string;
  limit_amount: number;
  balance: number;
  status: "active" | "inactive" | "blocked";
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

  onCreateTrustLine: (
    walletId: number,
    currency: string,
    issuer: string,
    limitAmount: number,
  ) => Promise<{
    success: boolean;
    message?: string;
    code?: number;
  }>;

  onDeleteTrustLine: (trustLineId: number) => Promise<boolean>;

  onSyncTrustLine: (trustLineId: number) => Promise<any>;
}

// ============================================================
// COMPONENTE
// ============================================================

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

  // ==========================================================
  // Estados generales
  // ==========================================================

  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [walletName, setWalletName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ==========================================================
  // 🔥 NUEVO: Modal de error para conexión manual
  // ==========================================================

  const [showWalletErrorModal, setShowWalletErrorModal] = useState(false);
  const [walletErrorMessage, setWalletErrorMessage] = useState("");
  const [walletErrorTitle, setWalletErrorTitle] = useState("");

  // ==========================================================
  // Trust Lines
  // ==========================================================

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [newLimitAmount, setNewLimitAmount] = useState(1000000);

  // ==========================================================
  // Modal gestión Trust Line
  // ==========================================================

  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTrustLine, setSelectedTrustLine] = useState<TrustLine | null>(
    null,
  );

  // ==========================================================
  // Modal confirmación
  // ==========================================================

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<
    (() => Promise<void>) | null
  >(null);

  // ==========================================================
  // Modal warning
  // ==========================================================

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ==========================================================
  // Modal envío
  // ==========================================================

  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedWalletForSend, setSelectedWalletForSend] =
    useState<Wallet | null>(null);

  // ==========================================================
  // Modal recibir
  // ==========================================================

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedWalletForReceive, setSelectedWalletForReceive] =
    useState<Wallet | null>(null);

  // ==========================================================
  // Modal éxito
  // ==========================================================

  const [successModalData, setSuccessModalData] = useState<{
    amount: string;
    destination: string;
    hash: string;
    date: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ==========================================================
  // Estados de carga
  // ==========================================================

  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ==========================================================
  // DEVNET SATURADA
  // ==========================================================

  const [isSaturated, setIsSaturated] = useState(false);
  const [saturationMessage, setSaturationMessage] = useState("");

  // ==========================================================
  // Auto desaparecer mensaje de éxito
  // ==========================================================

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ==========================================================
  // FORMATO BALANCE
  // ==========================================================

  const formatBalance = (value: any, decimals: number = 2): string => {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) {
      return "0.00";
    }
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // ==========================================================
  // CERRAR TODOS LOS MODALES
  // ==========================================================

  const closeAllModals = () => {
    setShowModal(false);
    setShowCreateModal(false);
    setShowManageModal(false);
    setShowConfirmModal(false);
    setShowWarningModal(false);
    setShowSendModal(false);
    setShowReceiveModal(false);
    setShowSuccessModal(false);
    setShowWalletErrorModal(false);
    setSelectedWalletForSend(null);
    setSelectedWalletForReceive(null);
    setSelectedTrustLine(null);
    setSuccessModalData(null);
  };

  // ==========================================================
  // 🔥 HELPER: mostrar modal de error de wallet manual
  // ==========================================================

  const showWalletError = (title: string, message: string) => {
    setWalletErrorTitle(title);
    setWalletErrorMessage(message);
    setShowWalletErrorModal(true);
  };

  // ==========================================================
  // VERIFICAR SATURACIÓN / CONGESTIÓN DEVNET
  // ==========================================================

  const checkSaturation = (message?: string): boolean => {
    if (!message) {
      return false;
    }

    const lower = message.toLowerCase();

    const keywords = [
      "saturated",
      "rate limit",
      "devnet saturada",
      "devnet congestionada",
      "too many requests",
      "429",
      "overloaded",
      "congestion",
      "busy",
      "server busy",
      "service unavailable",
    ];

    return keywords.some((keyword) => lower.includes(keyword));
  };

  // ==========================================================
  // MOSTRAR WARNING DE DEVNET CONGESTIONADA
  // ==========================================================

  const showSaturationWarning = (message: string) => {
    closeAllModals();
    setSaturationMessage(
      message ||
        "La red XRP Ledger Devnet está experimentando una alta demanda en este momento.",
    );
    setIsSaturated(true);
  };

  // ==========================================================
  // CONECTAR CON XAMAN
  // ==========================================================

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

      const existingAddresses = new Set(
        wallets.map((wallet) => wallet.address),
      );

      let addedCount = 0;
      let skippedCount = 0;

      for (const wallet of xamanWallets) {
        if (existingAddresses.has(wallet.address)) {
          skippedCount++;
          continue;
        }

        const added = await onAddWallet(
          wallet.address,
          wallet.name || "Wallet Xaman",
        );

        if (added) {
          addedCount++;
        }
      }

      if (addedCount === 0 && skippedCount > 0) {
        setSuccess(`✅ Todas las billeteras ya están conectadas.`);
        onRefreshWallets();
      } else if (addedCount > 0) {
        setSuccess(`✅ ${addedCount} billetera(s) agregada(s) exitosamente.`);
        setShowModal(false);
        setNewAddress("");
        setWalletName("");
        onRefreshWallets();
      } else {
        setError("No se pudo agregar ninguna billetera.");
      }
    } catch (err: any) {
      console.error("Error al conectar con Xaman:", err);
      const msg = err?.message || "Error al conectar con Xaman.";
      if (checkSaturation(msg)) {
        showSaturationWarning(msg);
      } else {
        setError(msg);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // ==========================================================
  // 🔥 CONECTAR MANUAL (ahora los errores van a un modal)
  // ==========================================================

  const handleConnectManual = async () => {
    const trimmedAddress = newAddress.trim();

    // 🔥 Validación 1: dirección vacía → MODAL
    if (!trimmedAddress) {
      showWalletError(
        "Dirección obligatoria",
        "Debes ingresar una dirección XRP para continuar.",
      );
      return;
    }

    // 🔥 Validación 2: formato inválido → MODAL
    if (!/^r[0-9a-zA-Z]{33,34}$/.test(trimmedAddress)) {
      showWalletError(
        "Dirección XRP inválida",
        "La dirección debe comenzar con 'r' y tener aproximadamente 34 caracteres alfanuméricos.",
      );
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const added = await onAddWallet(
        trimmedAddress,
        walletName.trim() || undefined,
      );

      if (added) {
        setShowModal(false);
        setNewAddress("");
        setWalletName("");
        setSuccess("✅ Billetera agregada exitosamente.");
        onRefreshWallets();
      } else {
        // 🔥 Error al agregar → MODAL
        showWalletError(
          "No se pudo agregar la billetera",
          "Verifica que la dirección sea correcta y que no esté ya registrada. Intenta nuevamente.",
        );
      }
    } catch (err: any) {
      console.error("Error al conectar manual:", err);
      const msg = err?.message || "Error al conectar la billetera.";

      if (checkSaturation(msg)) {
        showSaturationWarning(msg);
      } else {
        // 🔥 Error de red / servidor → MODAL
        showWalletError("Error al conectar la billetera", msg);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // ==========================================================
  // ELIMINAR TRUST LINE
  // ==========================================================

  const handleDeleteTrustLine = async () => {
    if (!selectedTrustLine) {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const deleted = await onDeleteTrustLine(selectedTrustLine.id);

      if (deleted) {
        setSuccess(
          `✅ Trust Line de ${getCurrencyDisplay(
            selectedTrustLine.currency,
          )} eliminado correctamente`,
        );
        setShowManageModal(false);
        setSelectedTrustLine(null);
        onRefreshWallets();
      } else {
        setError("Error al eliminar Trust Line");
      }
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      const msg = err?.message || "Error al eliminar Trust Line";
      if (checkSaturation(msg)) {
        showSaturationWarning(msg);
      } else {
        setError(msg);
      }
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  // ==========================================================
  // SINCRONIZAR TRUST LINE
  // ==========================================================

  const handleSyncTrustLine = async () => {
    if (!selectedTrustLine) {
      return;
    }

    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSyncTrustLine(selectedTrustLine.id);

      if (result && result.success) {
        setSuccess(
          `✅ Trust Line sincronizado correctamente. Balance: ${formatBalance(
            result.realBalance || 0,
          )} RLUSD`,
        );

        if (result.data) {
          setSelectedTrustLine({
            ...selectedTrustLine,
            balance: result.data.balance,
          });
        }

        onRefreshWallets();
      } else {
        const msg = result?.message || "Error al sincronizar";
        if (checkSaturation(msg)) {
          showSaturationWarning(msg);
        } else {
          setError(msg);
        }
      }
    } catch (err: any) {
      console.error("Error al sincronizar:", err);
      const msg = err?.message || "Error al sincronizar Trust Line";
      if (checkSaturation(msg)) {
        showSaturationWarning(msg);
      } else {
        setError(msg);
      }
    } finally {
      setSyncing(false);
    }
  };

  // ==========================================================
  // CREAR TRUST LINE
  // ==========================================================

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

    const wallet = wallets.find((w) => w.id === selectedWalletId);
    const existingTrustLine = wallet?.trustLines?.find(
      (tl) => tl.currency === currency && tl.issuer === issuer,
    );

    if (existingTrustLine) {
      setWarningMessage(
        "YA tienes un trust line para el token RLUSD en esta billetera.",
      );
      setShowWarningModal(true);
      setShowCreateModal(false);
      setNewLimitAmount(1000000);
      setSelectedWalletId(null);
      return;
    }

    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onCreateTrustLine(
        selectedWalletId,
        currency,
        issuer,
        newLimitAmount,
      );

      if (result.success) {
        setSuccess(
          `✅ Trust Line RLUSD creado exitosamente. Límite: ${formatBalance(
            newLimitAmount,
          )}`,
        );
        setShowCreateModal(false);
        setNewLimitAmount(1000000);
        setSelectedWalletId(null);
        onRefreshWallets();
      } else {
        const msg =
          result.message ||
          "Error al crear Trust Line. Verifica que la wallet tenga XRP para la comisión.";

        if (checkSaturation(msg) || result.code === 429) {
          showSaturationWarning(msg);
        } else {
          setError(msg);
        }
      }
    } catch (err: any) {
      console.error("Error al crear:", err);
      const msg =
        err?.message || "Error al crear Trust Line. Intenta de nuevo.";
      if (checkSaturation(msg)) {
        showSaturationWarning(msg);
      } else {
        setError(msg);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // ==========================================================
  // ABRIR CONFIRMACIÓN ELIMINAR
  // ==========================================================

  const openConfirmDelete = () => {
    setConfirmMessage(
      `¿Seguro que deseas eliminar el Trust Line de ${getCurrencyDisplay(
        selectedTrustLine?.currency || "",
      )}?`,
    );
    setConfirmAction(() => handleDeleteTrustLine);
    setShowConfirmModal(true);
  };

  // ==========================================================
  // ABRIR MODAL ENVÍO
  // ==========================================================

  const openSendModal = (wallet: Wallet) => {
    setSelectedWalletForSend(wallet);
    setShowSendModal(true);
  };

  // ==========================================================
  // ABRIR MODAL RECIBIR
  // ==========================================================

  const openReceiveModal = (wallet: Wallet) => {
    setSelectedWalletForReceive(wallet);
    setShowReceiveModal(true);
  };

  // ==========================================================
  // ÉXITO TRANSACCIÓN
  // ==========================================================

  const handleTransactionSuccess = (data: {
    amount: string;
    destination: string;
    hash: string;
    date: string;
  }) => {
    setSuccessModalData(data);
    setShowSuccessModal(true);
  };

  // ==========================================================
  // CERRAR ENVÍO + ÉXITO
  // ==========================================================

  const closeSendAndSuccess = () => {
    setShowSuccessModal(false);
    setShowSendModal(false);
    setSuccessModalData(null);
    setSelectedWalletForSend(null);
  };

  // ==========================================================
  // DESCARGAR RECIBO
  // ==========================================================

  const downloadSuccessReceipt = () => {
    if (!successModalData) {
      return;
    }

    const pdf = new jsPDF();
    const { amount, destination, hash, date } = successModalData;

    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("XRPL DEVNET", 105, 25, { align: "center" });

    pdf.setFontSize(15);
    pdf.setFont("helvetica", "normal");
    pdf.text("RECIBO DE TRANSFERENCIA", 105, 35, { align: "center" });
    pdf.line(20, 45, 190, 45);

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("ESTADO", 20, 60);
    pdf.setFont("helvetica", "normal");
    pdf.text("TRANSACCIÓN EXITOSA", 75, 60);

    pdf.setFont("helvetica", "bold");
    pdf.text("MONTO", 20, 80);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${amount} XRP`, 75, 80);

    pdf.setFont("helvetica", "bold");
    pdf.text("DESTINO", 20, 100);
    pdf.setFont("helvetica", "normal");
    const destLines = pdf.splitTextToSize(destination, 110);
    pdf.text(destLines, 75, 100);
    const destHeight = destLines.length * 7;

    const hashY = 120 + destHeight;
    pdf.setFont("helvetica", "bold");
    pdf.text("HASH", 20, hashY);
    pdf.setFont("helvetica", "normal");
    const hashLines = pdf.splitTextToSize(hash, 110);
    pdf.text(hashLines, 75, hashY);
    const hashHeight = hashLines.length * 7;

    const dateY = hashY + hashHeight + 15;
    pdf.setFont("helvetica", "bold");
    pdf.text("FECHA", 20, dateY);
    pdf.setFont("helvetica", "normal");
    pdf.text(date, 75, dateY);

    pdf.setFont("helvetica", "bold");
    pdf.text("RED", 20, dateY + 20);
    pdf.setFont("helvetica", "normal");
    pdf.text("XRPL Devnet", 75, dateY + 20);

    pdf.line(20, dateY + 35, 190, dateY + 35);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      "Comprobante generado por la wallet XRPL Devnet",
      105,
      dateY + 50,
      { align: "center" },
    );

    pdf.save(`xrpl-devnet-recibo-${hash.substring(0, 8)}.pdf`);
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const shortAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const greeting = user ? `Hola, ${user.username}` : "Hola";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {greeting}
        </h2>
        <p className="text-gray-400 text-sm">Tus billeteras XRP activas</p>
      </div>

      {/* ERROR GENERAL */}
      {error && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* SUCCESS GENERAL */}
      {success && (
        <div className="w-full p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* LOADING / WALLETS */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p>Cargando balances...</p>
        </div>
      ) : wallets.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <p className="text-gray-400">No tienes billeteras activas.</p>
          <p className="text-sm text-gray-500 mt-1">
            Agrega una usando los botones de abajo.
          </p>
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
                      {formatBalance(bal.xrp)} XRP
                    </div>
                    <div className="text-sm font-medium text-blue-400">
                      {formatBalance(bal.rlusd)} RLUSD
                    </div>
                  </div>
                </div>

                {/* BOTONES */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => openSendModal(wallet)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    📤 Enviar XRP
                  </button>
                  <button
                    onClick={() => openReceiveModal(wallet)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    📥 Recibir
                  </button>
                </div>

                {/* TRUST LINES */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Trust Lines
                    </p>
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
                            {getCurrencyDisplay(tl.currency)} (emisor:{" "}
                            {tl.issuer.slice(0, 6)}
                            ...)
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            Límite: {formatBalance(tl.limit_amount)}
                            {" | "}
                            Balance: {formatBalance(tl.balance)}
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
                    <p className="text-xs text-gray-500 mt-2">
                      No hay Trust Lines activos
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOTONES CONEXIÓN */}
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
              <span className="text-xl">🔗</span>
              Conectar con Xaman
            </>
          )}
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-dashed border-white/20 hover:bg-white/10 hover:border-indigo-500/50 transition-all text-gray-300 font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          Ingresar dirección manual
        </button>
      </div>

      {/* ======================================================
          🔥 MODAL DE ERROR DE WALLET MANUAL
          ====================================================== */}
      {showWalletErrorModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowWalletErrorModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#111111] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/40">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86l-8.82 15a2 2 0 001.71 3h17.64a2 2 0 001.71-3l-8.82-15a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                {walletErrorTitle || "Error"}
              </h3>
              <p className="text-gray-300 text-sm mb-6">{walletErrorMessage}</p>

              <button
                onClick={() => setShowWalletErrorModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-500/20"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEVNET CONGESTIONADA */}
      {isSaturated && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => {
            setIsSaturated(false);
            setSaturationMessage("");
          }}
        >
          <div
            className="relative w-full max-w-md bg-red-950/30 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-red-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-bold text-white">
                Red Devnet congestionada
              </h3>
            </div>
            <p className="text-gray-200 text-sm mb-4">
              La red XRP Ledger Devnet está experimentando una alta demanda en
              este momento.
              <br />
              <br />
              {saturationMessage ||
                "La transacción no pudo completarse porque la red está congestionada. Por favor, intenta nuevamente en unos minutos."}
            </p>
            <button
              onClick={() => {
                setIsSaturated(false);
                setSaturationMessage("");
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL DIRECCIÓN MANUAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              Conectar nueva wallet
            </h3>
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

      {/* MODAL CREAR TRUST LINE */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              🔗 Crear Trust Line RLUSD
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Crea un Trust Line para recibir RLUSD en esta billetera.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-gray-400">Token</p>
                <p className="text-white font-medium">RLUSD (Devnet)</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-gray-400">Emisor</p>
                <p className="text-white font-mono text-sm break-all">
                  {RLUSD_ISSUER}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Límite{" "}
                  <span className="text-xs text-gray-500">(Limit Amount)</span>
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
                  onBlur={() => {
                    const cleanValue = Math.floor(newLimitAmount);
                    if (!isNaN(cleanValue) && cleanValue > 0) {
                      setNewLimitAmount(cleanValue);
                    }
                  }}
                  placeholder="1000000"
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad máxima de RLUSD que deseas aceptar (debe ser mayor a
                  0).
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
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Creando..." : "Crear Trust Line"}
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
                ⚠️ Necesitas XRP en tu wallet para pagar la comisión de la
                transacción en XRPL Devnet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN TRUST LINE */}
      {showManageModal && selectedTrustLine && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowManageModal(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                🔧 Gestionar Trust Line
              </h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Moneda</span>
                  <span className="text-sm text-white font-medium">
                    {getCurrencyDisplay(selectedTrustLine.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Emisor</span>
                  <span className="text-sm text-white font-mono">
                    {selectedTrustLine.issuer.slice(0, 6)}...
                    {selectedTrustLine.issuer.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Límite</span>
                  <span className="text-sm text-blue-400 font-medium">
                    {formatBalance(selectedTrustLine.limit_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Balance</span>
                  <span className="text-sm text-green-400 font-medium">
                    {formatBalance(selectedTrustLine.balance)}
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

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            if (!deleting) setShowConfirmModal(false);
          }}
        >
          <div
            className="relative w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              ⚠️ Confirmar eliminación
            </h3>
            <p className="text-sm text-gray-300 mb-4">{confirmMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WARNING TRUST LINE DUPLICADO */}
      {showWarningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowWarningModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-white/10 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-xl font-semibold text-white">Atención</h3>
            </div>
            <p className="text-sm text-gray-300 mb-4">{warningMessage}</p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white font-medium"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* MODAL ENVÍO */}
      {showSendModal && selectedWalletForSend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            if (!showSuccessModal) {
              setShowSendModal(false);
              setSelectedWalletForSend(null);
            }
          }}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Enviar desde {selectedWalletForSend.name || "wallet"}
              </h3>
              <button
                onClick={() => {
                  if (!showSuccessModal) {
                    setShowSendModal(false);
                    setSelectedWalletForSend(null);
                  }
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <SendComponent
              walletAddress={selectedWalletForSend.address}
              onBalanceUpdate={onRefreshWallets}
              onTransactionSuccess={handleTransactionSuccess}
            />
          </div>
        </div>
      )}

      {/* MODAL RECIBIR */}
      {showReceiveModal && selectedWalletForReceive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowReceiveModal(false);
            setSelectedWalletForReceive(null);
          }}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Recibir en {selectedWalletForReceive.name || "wallet"}
              </h3>
              <button
                onClick={() => {
                  setShowReceiveModal(false);
                  setSelectedWalletForReceive(null);
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <ReciveComponent address={selectedWalletForReceive.address} />
          </div>
        </div>
      )}

      {/* MODAL ÉXITO */}
      {showSuccessModal && successModalData && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={closeSendAndSuccess}
        >
          <div
            className="relative w-full max-w-md bg-[#111111] border border-green-500/30 rounded-2xl shadow-2xl shadow-green-500/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40">
                <svg
                  className="w-10 h-10 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-1">
                ¡Transacción exitosa!
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                La transferencia de XRP fue procesada correctamente en XRPL
                Devnet.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500 text-sm">Cantidad</span>
                <span className="text-white font-semibold">
                  {successModalData.amount} XRP
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500 text-sm">Destino</span>
                <span className="text-gray-300 text-xs font-mono break-all max-w-[180px] text-right">
                  {successModalData.destination}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500 text-sm">Hash</span>
                <span className="text-gray-300 text-xs font-mono break-all max-w-[180px] text-right">
                  {successModalData.hash}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Fecha</span>
                <span className="text-gray-300 text-sm">
                  {successModalData.date}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500 text-sm">Red</span>
                <span className="text-indigo-400 text-sm font-medium">
                  XRPL Devnet
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={downloadSuccessReceipt}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-500/20"
              >
                📄 Descargar recibo
              </button>
              <button
                onClick={closeSendAndSuccess}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-all duration-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resume;
