const recive_component = ({ address }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Recibir XRP
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Comparte tu dirección para recibir fondos
      </p>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="font-mono text-sm text-gray-200 break-all bg-black/30 p-3 rounded-lg border border-white/10">
          {address}
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText(address)}
          className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2"
        >
          📋 Copiar dirección
        </button>
      </div>
    </div>
  );
};

export default recive_component;
