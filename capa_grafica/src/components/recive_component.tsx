// src/components/ReciveComponent.tsx
import { useState } from "react";
import xrpl from "xrpl";
import QRCode from "react-qr-code";

interface ReciveComponentProps {
  address: string;
}

const ReciveComponent = ({ address }: ReciveComponentProps) => {
  const [copied, setCopied] = useState(false);
  const isValidAddress = Boolean(address) && xrpl.isValidAddress(address);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  if (!address || !isValidAddress) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">❌ Dirección inválida o no disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">📥 Recibir fondos</h3>
      <p className="text-sm text-gray-400">
        Comparte tu dirección pública para recibir XRP o RLUSD.
      </p>
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-xl shadow-lg shadow-indigo-500/10">
          <QRCode
            value={address}
            size={200}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-xs text-gray-500 mb-1">Tu dirección pública:</p>
        <div className="font-mono text-sm text-gray-200 break-all bg-black/30 p-3 rounded-lg border border-white/10 select-all">
          {address}
        </div>
        <button
          onClick={handleCopy}
          className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              ¡Copiado!
            </>
          ) : (
            <>📋 Copiar dirección</>
          )}
        </button>
      </div>

      {/* Información de seguridad */}
      <div className="text-xs text-gray-500 space-y-1 border-t border-white/10 pt-3">
        <p>🔒 Esta es tu dirección pública. Es segura para compartir.</p>
        <p>⚠️ Nunca compartas tu clave privada o seed.</p>
        <p>💰 Solo recibirás fondos en la red de prueba (Testnet).</p>
      </div>
    </div>
  );
};

export default ReciveComponent;
