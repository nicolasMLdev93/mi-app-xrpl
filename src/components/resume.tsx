const resumne = ({
  address,
  shortAddress,
  balance,
}: {
  address: string;
  shortAddress: string;
  balance?: number;
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Resumen de la cuenta
        </h2>
        <p className="text-gray-400 text-sm">Vista general de tu wallet XRPL</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Dirección
          </div>
          <div className="font-mono text-sm text-gray-200 break-all mt-1">
            {address}
          </div>
          <div className="text-xs text-gray-500 mt-1">{shortAddress}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Balance
          </div>
          <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
            {balance?.toLocaleString() ?? "0"} XRP
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Fondos de prueba (Testnet)
          </div>
        </div>
      </div>
    </div>
  );
};

export default resumne;
