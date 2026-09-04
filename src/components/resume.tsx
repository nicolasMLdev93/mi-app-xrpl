import { useEffect, useState } from "react";
import { getRLUSDBalance } from "../utils/get_rlusd_balance";

interface ResumeProps {
  address: string;
  shortAddress: string;
  balance?: number;
}

const Resume = ({
  address,
  shortAddress,
  balance,
}: ResumeProps) => {
  const [rlusdBalance, setRlusdBalance] = useState<number>(0);
  const [loadingRLUSD, setLoadingRLUSD] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const loadRLUSDBalance = async () => {
      if (!address) return;

      try {
        setLoadingRLUSD(true);

        const balance = await getRLUSDBalance(address);

        if (mounted) {
          setRlusdBalance(balance);
        }
      } catch (error) {
        console.error(
          "❌ Error obteniendo balance RLUSD:",
          error
        );

        if (mounted) {
          setRlusdBalance(0);
        }
      } finally {
        if (mounted) {
          setLoadingRLUSD(false);
        }
      }
    };

    void loadRLUSDBalance();

    return () => {
      mounted = false;
    };
  }, [address]);

  return (
    <div className="space-y-6">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Resumen de la cuenta
        </h2>

        <p className="text-gray-400 text-sm">
          Vista general de tu wallet XRPL
        </p>
      </div>

      {/* Dirección */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="text-xs text-gray-400 uppercase tracking-wider">
          Dirección
        </div>

        <div className="font-mono text-sm text-gray-200 break-all mt-1">
          {address}
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {shortAddress}
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* XRP */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">

          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Balance XRP
          </div>

          <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text mt-2">
            {balance?.toLocaleString(undefined, {
              maximumFractionDigits: 6,
            }) ?? "0"}{" "}
            XRP
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Fondos de prueba · XRPL Testnet
          </div>

        </div>

        {/* RLUSD */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">

          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Stablecoin
          </div>

          <div className="flex items-center gap-2 mt-2">

            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
              $
            </div>

            <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
              {loadingRLUSD
                ? "..."
                : rlusdBalance.toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{" "}
              RLUSD
            </div>

          </div>

          <div className="text-xs text-gray-500 mt-2">
            RLUSD · XRPL Testnet
          </div>

        </div>

      </div>

    </div>
  );
};

export default Resume;