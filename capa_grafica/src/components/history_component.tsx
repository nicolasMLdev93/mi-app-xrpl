const history_component = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Historial
      </h2>
      <p className="text-gray-400 text-sm mb-4">Registro de transacciones</p>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="text-gray-300 text-sm">
          No hay transacciones recientes en Testnet.
        </div>
        <div className="text-xs text-gray-500 mt-1">
          * Próximamente con integración real.
        </div>
      </div>
    </div>
  );
};

export default history_component;
