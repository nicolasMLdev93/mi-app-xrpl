import App_logo from "../icons/app_logo";
import { FiLogOut } from "react-icons/fi";

const side_Bar = ({
  sidebarOpen,
  menuItems,
  activeTab,
  setActiveTab,
  address,
  shortAddress,
  balance,
  navigate,
}: {
  sidebarOpen: boolean;
  menuItems: Array<{ id: string; icon: any; label: string }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  address?: string;
  shortAddress?: string;
  balance?: number;
  navigate: (path: string) => void;
}) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-indigo-500/20 flex flex-col`}
    >
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
        <App_logo />
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          Room4-xrp
        </span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white shadow-lg shadow-indigo-500/10 border border-indigo-400/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
            {address?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-300 truncate">{shortAddress}</div>
            <div className="text-[10px] text-gray-500">
              {balance?.toFixed(2)} XRP
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300 border border-white/10"
        >
          <FiLogOut />
          Desconectar
        </button>
      </div>
    </div>
  );
};

export default side_Bar;
