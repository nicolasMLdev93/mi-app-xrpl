// src/components/SettingsComponent.tsx
import { useState } from "react";

const SettingsComponent = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [network, setNetwork] = useState("testnet");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChangePassword = () => {
    // Lógica para cambiar contraseña
    console.log("Cambiar contraseña");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      // Lógica para eliminar cuenta
      console.log("Cuenta eliminada");
    }
  };

  const handleExportHistory = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMessage("✅ Historial exportado correctamente");
      setTimeout(() => setMessage(null), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Ajustes
        </h2>
        <p className="text-gray-400 text-sm">Configura tu cuenta y preferencias.</p>
      </div>

      {message && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* ====== 1. PERFIL ====== */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">👤 Perfil</h3>
        <div className="space-y-3">
          <button
            onClick={handleChangePassword}
            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-200 transition-colors text-left"
          >
            🔒 Cambiar contraseña
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors text-left"
          >
            🗑️ Eliminar cuenta
          </button>
        </div>
      </div>

      {/* ====== 2. PREFERENCIAS ====== */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">🎨 Preferencias</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">🔔 Notificaciones</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                notifications ? "bg-indigo-600 text-white" : "bg-gray-600 text-gray-300"
              }`}
            >
              {notifications ? "Activadas" : "Desactivadas"}
            </button>
          </div>
        </div>
      </div>

      {/* ====== 3. RED ====== */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">🌐 Red</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setNetwork("testnet")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              network === "testnet" ? "bg-indigo-600 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            Testnet
          </button>
          <button
            onClick={() => setNetwork("mainnet")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              network === "mainnet" ? "bg-indigo-600 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            Mainnet
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ⚠️ Cambiar de red afecta a las transacciones y balances mostrados.
        </p>
      </div>

      {/* ====== 4. DATOS ====== */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">📊 Datos</h3>
        <button
          onClick={handleExportHistory}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Exportando...
            </>
          ) : (
            "📥 Exportar historial"
          )}
        </button>
      </div>

      {/* ====== 5. INFORMACIÓN ====== */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">ℹ️ Información</h3>
        <div className="space-y-1 text-sm text-gray-400">
          <p>Versión: <span className="text-gray-300">1.0.0</span></p>
          <p>Entorno: <span className="text-gray-300">Testnet</span></p>
          <p className="pt-2 border-t border-white/10">
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Términos y condiciones</a>
          </p>
          <p>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Política de privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;