import { useEffect, useState } from "react";
import { Client } from "xrpl";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Obtener el saldo de la wallet
  const fetchBalance = async (addr: string) => {
    setIsLoading(true);
    try {
      const client = new Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      const bal = await client.getXrpBalance(addr);
      setBalance(bal);
      await client.disconnect();
    } catch (error) {
      console.error("Error al obtener saldo:", error);
      setBalance("0");
    } finally {
      setIsLoading(false);
    }
  };

  // Fondear la wallet (opcional, si no tiene saldo)
  const fundWallet = async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const client = new Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      // Para fondear necesitamos una wallet con seed; la guardamos en sessionStorage (¡solo para testing!)
      const seed = sessionStorage.getItem("xrplSeed");
      if (!seed) {
        alert("No se encontró la seed. Vuelve a conectar.");
        return;
      }
      const wallet = Wallet.fromSeed(seed);
      await client.fundWallet(wallet);
      await client.disconnect();
      // Actualizar saldo
      await fetchBalance(address);
      alert("¡Wallet fondeada con 1000 XRP de prueba!");
    } catch (error) {
      console.error("Error al fondear:", error);
      alert("No se pudo fondear. Intenta más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("xrplPublicKey") || localStorage.getItem("xrplPublicKey");
    if (!stored) {
      // Si no hay dirección, redirigir al login
      navigate("/");
      return;
    }
    setAddress(stored);
    fetchBalance(stored);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("xrplPublicKey");
    sessionStorage.removeItem("xrplSeed");
    localStorage.removeItem("xrplPublicKey");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-indigo-500/10">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🏠 Dashboard
        </h1>
        <p className="text-gray-300 text-center mt-2">Bienvenido a Room4-xrp</p>

        {address && (
          <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/5">
            <p className="text-sm text-gray-400">Dirección:</p>
            <p className="text-indigo-300 break-all text-sm">{address}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Saldo (Testnet XRP):</p>
            <p className="text-2xl font-bold text-green-400">
              {isLoading ? "Cargando..." : `${balance} XRP`}
            </p>
          </div>
          <button
            onClick={fundWallet}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : "💰 Fondear"}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Home;