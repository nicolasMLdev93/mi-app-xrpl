import { useState } from "react";
import xrpl from "xrpl";
import test_transaction from "../components/test_transaction";

// Definimos las props que acepta el componente
interface SendComponentProps {
  onBalanceUpdate?: () => Promise<void> | void; // función opcional para actualizar balance
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

  // Obtener datos de sessionStorage (solo para Testnet)
  const address = sessionStorage.getItem("xrplPublicKey");
  const seed = sessionStorage.getItem("xrplSeed");

  const handleSend = async () => {
    // Validaciones básicas
    if (!address || !seed) {
      setTxResult({
        success: false,
        error: "No hay sesión activa. Reconéctate.",
      });
      return;
    }
    if (!destination || !xrpl.isValidAddress(destination)) {
      setTxResult({ success: false, error: "Dirección destino inválida" });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setTxResult({ success: false, error: "Cantidad inválida" });
      return;
    }

    setIsLoading(true);
    setTxResult(null);

    try {
      // Reconstruir la wallet desde el seed
      const wallet = xrpl.Wallet.fromSeed(seed);

      // Llamar a la función de transacción
      const result = await test_transaction({
        address,
        amount, // en XRP (la función convierte a drops)
        destination,
        wallet,
      });

      setTxResult({
        success: result.success,
        hash: result.hash,
        error: result.error,
      });

      if (result.success) {
        // Limpiar campos
        setAmount("");
        setDestination("");

        // 🔥 ¡Actualizar el balance en el padre (Home)!
        if (onBalanceUpdate) {
          await onBalanceUpdate();
        }
      }
    } catch (error: any) {
      setTxResult({
        success: false,
        error: error.message || "Error desconocido",
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
          disabled={isLoading || !address || !seed}
          className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Enviando..." : "Enviar (demo)"}
        </button>

        {/* Mostrar resultado de la transacción */}
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
              <>❌ Error: {txResult.error || "Falló la transacción"}</>
            )}
          </div>
        )}

        {/* Advertencia de seguridad (solo Testnet) */}
        <div className="mt-2 text-xs text-yellow-400/70 bg-yellow-400/10 p-2 rounded-lg">
          ⚠️ Demo en Testnet – la seed se guarda en sessionStorage (no hacer en
          Mainnet)
        </div>
      </div>
    </div>
  );
};

export default SendComponent;