import { useState } from "react";
import { createPortal } from "react-dom";
import xrpl from "xrpl";
import test_transaction from "../utils/test_transaction";
import simulatedWallet from "../utils/simulated_wallet";

interface SendComponentProps {
  walletAddress?: string;
  onBalanceUpdate?: () => Promise<void> | void;
  onTransactionSuccess?: (data: {
    amount: string;
    destination: string;
    hash: string;
    date: string;
  }) => void;
}

const SendComponent = ({
  walletAddress,
  onBalanceUpdate,
  onTransactionSuccess,
}: SendComponentProps) => {
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
  const [showCongestionModal, setShowCongestionModal] = useState(false);
  const [showPublicWalletModal, setShowPublicWalletModal] = useState(false);
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);

  const address = walletAddress || sessionStorage.getItem("xrplPublicKey");

  const closeAllModals = () => {
    if (isLoading) return;

    setShowAmountError(false);
    setShowAddressError(false);
    setShowInsufficientFunds(false);
    setShowCongestionModal(false);
    setShowPublicWalletModal(false);
    setShowConfirmSendModal(false);
  };

  const handleSend = () => {
    if (!address) {
      setTxResult({
        success: false,
        error: "No hay una wallet conectada. Reconéctate.",
      });
      return;
    }

    setTxResult(null);
    closeAllModals();

    const cleanDestination = destination.trim();

    if (!cleanDestination || !xrpl.isValidAddress(cleanDestination)) {
      setShowAddressError(true);
      return;
    }

    const numericAmount = Number(amount);

    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setShowAmountError(true);
      return;
    }

    const connectedWallet = simulatedWallet.getWallet();

    if (!connectedWallet || connectedWallet.classicAddress !== address) {
      setShowPublicWalletModal(true);
      return;
    }

    setShowConfirmSendModal(true);
  };

  const handleConfirmModalClose = () => {
    if (isLoading) return;
    setShowConfirmSendModal(false);
  };

  const executeSend = async () => {
    if (!address) {
      setShowConfirmSendModal(false);
      setTxResult({
        success: false,
        error: "No hay una wallet conectada. Reconéctate.",
      });
      return;
    }

    const connectedWallet = simulatedWallet.getWallet();

    if (!connectedWallet || connectedWallet.classicAddress !== address) {
      setShowConfirmSendModal(false);
      setShowPublicWalletModal(true);
      return;
    }

    const cleanDestination = destination.trim();
    const numericAmount = Number(amount);

    if (
      !cleanDestination ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await test_transaction({
        address,
        amount,
        destination: cleanDestination,
        signTransaction: (transaction) =>
          simulatedWallet.signTransaction(transaction),
      });

      setShowConfirmSendModal(false);

      if (
        !result.success &&
        (result.code === "tefBAD_AUTH" ||
          result.error?.includes("LastLedgerSequence") ||
          result.error?.includes("latest ledger sequence"))
      ) {
        setShowCongestionModal(true);
        return;
      }

      if (!result.success && result.error?.includes("tecUNFUNDED_PAYMENT")) {
        setShowInsufficientFunds(true);
        return;
      }

      if (!result.success) {
        setTxResult({
          success: false,
          hash: result.hash,
          error: result.error || "No se pudo completar la transacción.",
        });
        return;
      }

      if (result.success && result.hash) {
        const transactionDate = new Date();

        if (onTransactionSuccess) {
          onTransactionSuccess({
            amount,
            destination: cleanDestination,
            hash: result.hash,
            date: transactionDate.toLocaleString("es-UY"),
          });
        }

        setAmount("");
        setDestination("");

        if (onBalanceUpdate) {
          try {
            await onBalanceUpdate();
          } catch (balanceError) {
            console.error("Error al actualizar balance:", balanceError);
          }
        }
      }
    } catch (error: unknown) {
      setShowConfirmSendModal(false);

      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";

      if (
        errorMessage.includes("tefBAD_AUTH") ||
        errorMessage.includes("LastLedgerSequence") ||
        errorMessage.includes("latest ledger sequence")
      ) {
        setShowCongestionModal(true);
        return;
      }

      if (errorMessage.includes("tecUNFUNDED_PAYMENT")) {
        setShowInsufficientFunds(true);
        return;
      }

      setTxResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : "No conectada";

  const renderModal = (
    show: boolean,
    onClose: () => void,
    children: React.ReactNode,
    zIndex: string = "z-50",
  ) => {
    if (!show) return null;

    return createPortal(
      <div
        className={`fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 ${zIndex}`}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Enviar XRP
        </h2>

        {walletAddress && (
          <p className="text-gray-400 text-sm mb-2">
            Desde:{" "}
            <span className="text-indigo-300 font-mono">{shortAddress}</span>
          </p>
        )}

        <p className="text-gray-400 text-sm mb-4">
          Transfiere fondos a otra cuenta (Devnet)
        </p>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
          <input
            type="text"
            placeholder="Dirección destino (r...)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
            disabled={isLoading}
          />

          <input
            type="number"
            placeholder="Cantidad en XRP"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (Number(value) < 0) return;
              setAmount(value);
            }}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
            disabled={isLoading}
            min="0"
            step="0.000001"
          />

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
                    d="M21 12a9 9 0 0 1-9 9v-3a6 6 0 0 0 6-6h3z"
                  />
                </svg>
                <span>Enviando...</span>
              </span>
            ) : (
              "Enviar"
            )}
          </button>

          {txResult && !txResult.success && (
            <div className="mt-2 p-2 rounded-lg text-sm bg-red-500/20 text-red-300">
              ❌ Error: {txResult.error || "Falló la transacción"}
            </div>
          )}
        </div>
      </div>

      {renderModal(
        showPublicWalletModal,
        closeAllModals,
        <>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <svg
                className="w-10 h-10 text-yellow-400"
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
            <h3 className="text-2xl font-bold text-white mb-3">
              No se puede realizar la transacción
            </h3>

            <p className="text-gray-400 text-sm mb-5">
              Esta cuenta de la Devnet fue cargada únicamente con su dirección
              pública y no tiene la seed disponible para firmar transacciones.
            </p>

            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 mb-6 text-left">
              <p className="text-gray-300 text-sm mb-2">
                Para poder enviar fondos necesitás:
              </p>

              <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
                <li>La seed privada de la billetera.</li>
                <li>
                  Tener la billetera conectada de forma que permita firmar
                  transacciones.
                </li>
              </ul>
            </div>

            <button
              onClick={closeAllModals}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
            >
              Entendido
            </button>
          </div>
        </>,
        "z-[90]",
      )}

      {renderModal(
        showConfirmSendModal,
        handleConfirmModalClose,
        <>
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/15 border-2 border-indigo-500/40">
              <span className="text-3xl">{isLoading ? "⏳" : "❓"}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white text-center mb-2">
            {isLoading ? "Procesando transferencia" : "Confirmar transferencia"}
          </h3>

          {!isLoading && (
            <p className="text-sm text-gray-300 text-center mb-5">
              ¿Seguro que deseas transferir{" "}
              <span className="text-indigo-400 font-semibold">
                {amount} XRP
              </span>{" "}
              a la billetera
            </p>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-6">
            <p className="text-xs text-gray-400 mb-1">Dirección destino</p>
            <p className="text-gray-200 text-xs font-mono break-all">
              {destination.trim()}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <svg
                className="w-6 h-6 animate-spin text-indigo-400"
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
                  d="M21 12a9 9 0 0 1-9 9v-3a6 6 0 0 0 6-6h3z"
                />
              </svg>

              <p className="text-xs text-gray-500 text-center">
                La transferencia está siendo procesada. No cierres esta ventana
                hasta que finalice.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={executeSend}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-500/20"
              >
                Aceptar
              </button>

              <button
                onClick={() => setShowConfirmSendModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          )}
        </>,
        "z-[80]",
      )}

      {renderModal(
        showAddressError,
        closeAllModals,
        <>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30">
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

            <button
              onClick={closeAllModals}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
            >
              Entendido
            </button>
          </div>
        </>,
        "z-50",
      )}

      {renderModal(
        showAmountError,
        closeAllModals,
        <>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30">
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
              La cantidad debe ser mayor a 0.
            </p>

            <button
              onClick={closeAllModals}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
            >
              Entendido
            </button>
          </div>
        </>,
        "z-50",
      )}

      {renderModal(
        showInsufficientFunds,
        closeAllModals,
        <>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30">
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
              No tenés suficiente XRP para esta transferencia.
            </p>

            <button
              onClick={closeAllModals}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
            >
              Entendido
            </button>
          </div>
        </>,
        "z-50",
      )}

      {renderModal(
        showCongestionModal,
        closeAllModals,
        <>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/40">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
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
            <h3 className="text-2xl font-bold text-white mb-2">
              No se puede efectuar la transacción
            </h3>

            <p className="text-gray-400 text-sm mb-6">
              Esta billetera no tiene la seed almacenada en el navegador, por lo
              que no puede firmar transacciones.
            </p>

            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6 text-left">
              <p className="text-gray-300 text-sm mb-2">Esto ocurre cuando:</p>

              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>
                  La billetera fue cargada manualmente desde la devnet solo con
                  su dirección pública.
                </li>
                <li>
                  La billetera fue creada anteriormente y su seed ya no está
                  disponible.
                </li>
              </ul>
            </div>

            <button
              onClick={closeAllModals}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-500/20"
            >
              Entendido
            </button>
          </div>
        </>,
        "z-[20]",
      )}
    </>
  );
};

export default SendComponent;
