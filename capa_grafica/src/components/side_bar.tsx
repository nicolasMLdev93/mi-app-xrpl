import { useState } from "react";
import App_logo from "../icons/app_logo";
import { FiLogOut } from "react-icons/fi";

interface SideBarProps {
  sidebarOpen: boolean;
  menuItems: Array<{ id: string; icon: any; label: string }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigate: (path: string) => void;
}

const SideBar = ({
  sidebarOpen,
  menuItems,
  activeTab,
  setActiveTab,
  navigate,
}: SideBarProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const initial = user?.username?.charAt(0).toUpperCase() || "U";

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }, 1500);
  };

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
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.username || "Usuario"}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {user?.email || "sin email"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Cerrando sesión...
            </>
          ) : (
            <>
              <FiLogOut />
              Desconectar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SideBar;
