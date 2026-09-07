import { Wallet, Loader2 } from "lucide-react";

interface LoginBtnProps {
  handleConnect: () => void;
  isLoading: boolean;
}

const Login_btn = ({ handleConnect, isLoading }: LoginBtnProps) => {
  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/40 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Conectando con Xaman...
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5" />
          Conectar con Xaman
        </>
      )}
    </button>
  );
};

export default Login_btn;
