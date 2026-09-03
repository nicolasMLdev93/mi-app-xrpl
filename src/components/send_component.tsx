import { useState } from "react";
import xrpl from "xrpl";
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

  const address = sessionStorage.getItem("xrplPublicKey");

  const handleSend = async () => {
    if (!address) {
      setTxResult({
        success: false,
        error: "No hay una wallet conectada. Reconéctate.",
      });
      return;
    }

    if (!destination || !xrpl.isValidAddress(destination)) {
      setTxResult({
        success: false,
        error: "Dirección destino inválida",
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setTxResult({
        success: false,
        error: "Cantidad inválida",
      });
      return;
    }

    setIsLoading(true);
    setTxResult(null);

    try {
      const result = await test_transaction({
        address,
        amount,
        destination,

        // La wallet simulada se encarga de firmar
        signTransaction: (transaction) =>
          simulatedWallet.signTransaction(transaction),
      });

      setTxResult({
        success: result.success,
        hash: result.hash,
        error: result.error,
      });

      if (result.success) {
        setAmount("");
        setDestination("");

        if (onBalanceUpdate) {
          await onBalanceUpdate();
        }
      }

    } catch (error: unknown) {
      setTxResult({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Enviar XRP
      </h2>

      <p className="text-gray-400 text-sm mb-4">
        Transfiere fondos a otra cuenta (Testnet)
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
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors"
          disabled={isLoading}
          min="0"
          step="0.000001"
        />

        <button
          onClick={handleSend}
          disabled={isLoading || !address}
          className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Enviando..." : "Enviar"}
        </button>

        {txResult && (
          <div
            className={`mt-2 p-2 rounded-lg text-sm ${
              txResult.success === undefined
                ? "bg-gray-500/20 text-gray-300"
                : txResult.success
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
            }`}
          >
            {txResult.success === undefined ? (
              "⏳ Procesando..."
            ) : txResult.success ? (
              <>
                ✅ Transacción exitosa

                {txResult.hash && (
                  <div className="text-xs break-all mt-1 opacity-80">
                    Hash: {txResult.hash}
                  </div>
                )}
              </>
            ) : (
              <>
                ❌ Error:{" "}
                {txResult.error || "Falló la transacción"}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SendComponent;