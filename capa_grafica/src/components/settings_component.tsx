const settings_component = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Ajustes
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Configuración de la aplicación
      </p>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Modo oscuro</span>
          <span className="text-xs text-gray-500">(siempre activo)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Red actual</span>
          <span className="text-xs text-indigo-400 font-mono">Testnet</span>
        </div>
        <button className="w-full mt-2 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors">
          Resetear aplicación
        </button>
      </div>
    </div>
  );
};

export default settings_component;
