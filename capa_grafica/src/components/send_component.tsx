import { useState } from "react";
import xrpl from "xrpl";
import { jsPDF } from "jspdf";

import test_transaction from "../utils/test_transaction";
import simulatedWallet from "../utils/simulated_wallet";

interface SendComponentProps {
  onBalanceUpdate?: () => Promise<void> | void;
}

const SendComponent = ({ onBalanceUpdate }: SendComponentProps) => {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [txResult, setTxResult] = useState<{
    success?: boolean;
    hash?: string;
    error?: string;
  } | null>(null);

  const [showAmountError, setShowAmountError] = useState(false);
  const [showAddressError, setShowAddressError] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [successData, setSuccessData] = useState<{
    amount: string;
    destination: string;
    hash: string;
    date: string;
  } | null>(null);

  const address = sessionStorage.getItem("xrplPublicKey");

  const handleSend = async () => {
    // ================================
    // VERIFICAR WALLET
    // ================================

    if (!address) {
      setTxResult({
        success: false,
        error: "No hay una wallet conectada. Reconéctate.",
      });

      return;
    }

    // ================================
    // CERRAR ERRORES ANTERIORES
    // ================================

    setTxResult(null);
    setShowAmountError(false);
    setShowAddressError(false);
    setShowInsufficientFunds(false);

    // ================================
    // VALIDAR DIRECCIÓN
    // ================================

    const cleanDestination = destination.trim();

    if (!cleanDestination || !xrpl.isValidAddress(cleanDestination)) {
      setShowAddressError(true);
      return;
    }

    // ================================
    // VALIDAR CANTIDAD
    // ================================

    const numericAmount = Number(amount);

    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setShowAmountError(true);
      return;
    }

    setIsLoading(true);

    try {
      // ================================
      // REALIZAR TRANSACCIÓN XRP
      // ================================

      const result = await test_transaction({
        address,
        amount,
        destination: cleanDestination,

        signTransaction: (transaction) =>
          simulatedWallet.signTransaction(transaction),
      });

      // ================================
      // FONDOS INSUFICIENTES
      // ================================

      if (!result.success && result.error?.includes("tecUNFUNDED_PAYMENT")) {
        setShowInsufficientFunds(true);

        return;
      }

      // ================================
      // ERROR GENERAL
      // ================================

      if (!result.success) {
        setTxResult({
          success: false,
          hash: result.hash,
          error: result.error || "No se pudo completar la transacción.",
        });

        return;
      }

      // ================================
      // TRANSACCIÓN EXITOSA
      // ================================

      if (result.success && result.hash) {
        const transactionDate = new Date();

        const newSuccessData = {
          amount,
          destination: cleanDestination,
          hash: result.hash,
          date: transactionDate.toLocaleString("es-UY"),
        };

        setSuccessData(newSuccessData);
        setShowSuccessPopup(true);

        // Limpiar formulario
        setAmount("");
        setDestination("");

        // ================================
        // ACTUALIZAR BALANCE XRP
        // ================================

        if (onBalanceUpdate) {
          try {
            await onBalanceUpdate();
          } catch (balanceError) {
            console.error(
              "⚠️ La transacción fue exitosa, pero no se pudo actualizar el balance:",
              balanceError,
            );
          }
        }
      }
    } catch (error: unknown) {
      console.error("❌ Error en la ejecución:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      // ================================
      // FONDOS INSUFICIENTES
      // ================================

      if (errorMessage.includes("tecUNFUNDED_PAYMENT")) {
        setShowInsufficientFunds(true);
        return;
      }

      // ================================
      // ERROR GENERAL
      // ================================

      setTxResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // DESCARGAR RECIBO PDF
  // ========================================

  const downloadReceipt = () => {
    if (!successData) {
      return;
    }

    const pdf = new jsPDF();

    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");

    pdf.text("XRPL TESTNET", 105, 25, {
      align: "center",
    });

    pdf.setFontSize(15);
    pdf.setFont("helvetica", "normal");

    pdf.text("RECIBO DE TRANSFERENCIA", 105, 35, {
      align: "center",
    });

    pdf.line(20, 45, 190, 45);

    // ESTADO

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");

    pdf.text("ESTADO", 20, 60);

    pdf.setFont("helvetica", "normal");

    pdf.text("TRANSACCIÓN EXITOSA", 75, 60);

    // MONTO

    pdf.setFont("helvetica", "bold");

    pdf.text("MONTO", 20, 80);

    pdf.setFont("helvetica", "normal");

    pdf.text(`${successData.amount} XRP`, 75, 80);

    // DESTINO

    pdf.setFont("helvetica", "bold");

    pdf.text("DESTINO", 20, 100);

    pdf.setFont("helvetica", "normal");

    const destinationLines = pdf.splitTextToSize(successData.destination, 110);

    pdf.text(destinationLines, 75, 100);

    const destinationHeight = destinationLines.length * 7;

    // HASH

    const hashY = 120 + destinationHeight;

    pdf.setFont("helvetica", "bold");

    pdf.text("HASH", 20, hashY);

    pdf.setFont("helvetica", "normal");

    const hashLines = pdf.splitTextToSize(successData.hash, 110);

    pdf.text(hashLines, 75, hashY);

    const hashHeight = hashLines.length * 7;

    // FECHA

    const dateY = hashY + hashHeight + 15;

    pdf.setFont("helvetica", "bold");

    pdf.text("FECHA", 20, dateY);

    pdf.setFont("helvetica", "normal");

    pdf.text(successData.date, 75, dateY);

    // RED

    pdf.setFont("helvetica", "bold");

    pdf.text("RED", 20, dateY + 20);

    pdf.setFont("helvetica", "normal");

    pdf.text("XRPL Testnet", 75, dateY + 20);

    pdf.line(20, dateY + 35, 190, dateY + 35);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);

    pdf.text(
      "Comprobante generado por la wallet XRPL Testnet",
      105,
      dateY + 50,
      {
        align: "center",
      },
    );

    const fileName = `xrpl-recibo-${successData.hash.substring(0, 8)}.pdf`;

    pdf.save(fileName);
  };

  return (
    <>
      {/* ===================================== */}
      {/* FORMULARIO */}
      {/* ===================================== */}

      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Enviar XRP
        </h2>

        <p className="text-gray-400 text-sm mb-4">
          Transfiere fondos a otra cuenta (Testnet)
        </p>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
          {/* DESTINO */}

          <input
            type="text"
            placeholder="Dirección destino (r...)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
            disabled={isLoading}
          />

          {/* CANTIDAD */}

          <input
            type="number"
            placeholder="Cantidad en XRP"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;

              if (Number(value) < 0) {
                return;
              }

              setAmount(value);
            }}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
            disabled={isLoading}
            min="0"
            step="0.000001"
          />

          {/* BOTÓN */}

          <button
            onClick={handleSend}
            disabled={isLoading || !address}
            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                  />

                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3z"
                  />
                </svg>

                <span>Enviando...</span>
              </span>
            ) : (
              "Enviar"
            )}
          </button>

          {/* ERROR GENERAL */}

          {txResult && !txResult.success && (
            <div className="mt-2 p-2 rounded-lg text-sm bg-red-500/20 text-red-300">
              ❌ Error: {txResult.error || "Falló la transacción"}
            </div>
          )}
        </div>
      </div>

      {/* ===================================== */}
      {/* POPUP DIRECCIÓN INVÁLIDA */}
      {/* ===================================== */}

      {showAddressError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={() => setShowAddressError(false)}
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="w-full max-w-md bg-[#111111] border border-red-500/20 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "popupEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex justify-center mb-5">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30"
                style={{
                  animation: "iconBounce 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Dirección inválida
              </h3>

              <p className="text-gray-400 text-sm mb-5">
                No se pudo validar la dirección de destino.
              </p>

              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  La dirección introducida no es válida para la red XRPL.
                </p>

                <p className="text-gray-500 text-xs mt-2">
                  Verifica que la dirección esté correctamente escrita antes de
                  continuar.
                </p>
              </div>

              <button
                onClick={() => setShowAddressError(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* POPUP CANTIDAD INVÁLIDA */}
      {/* ===================================== */}

      {showAmountError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={() => setShowAmountError(false)}
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="w-full max-w-md bg-[#111111] border border-red-500/20 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "popupEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex justify-center mb-5">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30"
                style={{
                  animation: "iconBounce 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86l-8.82 15a2 2 0 001.71 3h17.64a2 2 0 001.71 3l-8.82-15a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Cantidad inválida
              </h3>

              <p className="text-gray-400 text-sm mb-5">
                No se puede realizar la transferencia.
              </p>

              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  La cantidad de XRP debe ser{" "}
                  <span className="font-semibold text-white">mayor a 0</span>.
                </p>

                <p className="text-gray-500 text-xs mt-2">
                  Introduce una cantidad válida para continuar con la operación.
                </p>
              </div>

              <button
                onClick={() => setShowAmountError(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* POPUP FONDOS INSUFICIENTES */}
      {/* ===================================== */}

      {showInsufficientFunds && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={() => setShowInsufficientFunds(false)}
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="w-full max-w-md bg-[#111111] border border-yellow-500/20 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "warningPopupEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex justify-center mb-5">
              <div
                className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30"
                style={{
                  animation: "warningIcon 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <svg
                  className="w-10 h-10 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M10.29 3.86l-8.82 15a2 2 0 001.71 3h17.64a2 2 0 001.71 3l-8.82-15a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white mb-2">
                Fondos insuficientes
              </h3>

              <p className="text-gray-400 text-sm mb-5">
                No tenés suficiente XRP disponible para realizar esta
                transferencia.
              </p>

              <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Intentás enviar</span>

                  <span className="text-yellow-400 font-semibold">
                    {amount} XRP
                  </span>
                </div>

                <p className="text-gray-500 text-xs mt-3">
                  Verificá el balance de tu wallet y asegurate de conservar
                  suficiente XRP para la reserva de la cuenta.
                </p>
              </div>

              <button
                onClick={() => setShowInsufficientFunds(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-yellow-500/10"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* POPUP TRANSACCIÓN EXITOSA */}
      {/* ===================================== */}

      {showSuccessPopup && successData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={() => setShowSuccessPopup(false)}
          style={{
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div
            className="w-full max-w-md bg-[#111111] border border-green-500/20 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation:
                "successPopupEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex justify-center mb-5">
              <div
                className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30"
                style={{
                  animation: "successIcon 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <svg
                  className="w-10 h-10 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
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
              <h3 className="text-2xl font-semibold text-white mb-2">
                ¡Transacción exitosa!
              </h3>

              <p className="text-gray-400 text-sm mb-6">
                La transferencia de XRP fue procesada correctamente.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Cantidad</span>

                <span className="text-white font-semibold">
                  {successData.amount} XRP
                </span>
              </div>

              <div>
                <span className="text-gray-500 text-sm block mb-1">
                  Destino
                </span>

                <span className="text-gray-300 text-xs break-all">
                  {successData.destination}
                </span>
              </div>

              <div>
                <span className="text-gray-500 text-sm block mb-1">
                  Transaction Hash
                </span>

                <span className="text-gray-300 text-xs break-all">
                  {successData.hash}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Fecha</span>

                <span className="text-gray-300 text-xs">
                  {successData.date}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Red</span>

                <span className="text-indigo-400 text-sm font-medium">
                  XRPL Testnet
                </span>
              </div>
            </div>

            <button
              onClick={downloadReceipt}
              className="w-full py-3 mb-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-500/10"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                  />
                </svg>
                Descargar recibo
              </span>
            </button>

            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* ANIMACIONES */}
      {/* ===================================== */}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes popupEnter {
            from {
              opacity: 0;
              transform: scale(0.85) translateY(20px);
            }

            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes successPopupEnter {
            from {
              opacity: 0;
              transform: scale(0.75) translateY(30px);
            }

            60% {
              opacity: 1;
              transform: scale(1.03) translateY(-3px);
            }

            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes iconBounce {
            0% {
              opacity: 0;
              transform: scale(0.4);
            }

            60% {
              opacity: 1;
              transform: scale(1.15);
            }

            80% {
              transform: scale(0.95);
            }

            100% {
              transform: scale(1);
            }
          }

          @keyframes successIcon {
            0% {
              opacity: 0;
              transform: scale(0.2) rotate(-20deg);
            }

            50% {
              opacity: 1;
              transform: scale(1.2) rotate(5deg);
            }

            70% {
              transform: scale(0.9) rotate(0deg);
            }

            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }

          @keyframes warningPopupEnter {
            from {
              opacity: 0;
              transform: scale(0.75) translateY(30px);
            }

            60% {
              opacity: 1;
              transform: scale(1.04) translateY(-4px);
            }

            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes warningIcon {
            0% {
              opacity: 0;
              transform: scale(0.3) rotate(-15deg);
            }

            45% {
              opacity: 1;
              transform: scale(1.18) rotate(5deg);
            }

            65% {
              transform: scale(0.92) rotate(-2deg);
            }

            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }
        `}
      </style>
    </>
  );
};

export default SendComponent;
