const App_logo = () => {
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8"
      >
        {/* Nodo central */}
        <circle cx="12" cy="12" r="3" fill="white" stroke="white" />
        {/* Conexiones */}
        <line x1="12" y1="9" x2="12" y2="3" />
        <line x1="12" y1="15" x2="12" y2="21" />
        <line x1="9" y1="12" x2="3" y2="12" />
        <line x1="15" y1="12" x2="21" y2="12" />
        <line x1="9.5" y1="9.5" x2="4.5" y2="4.5" />
        <line x1="14.5" y1="14.5" x2="19.5" y2="19.5" />
        <line x1="14.5" y1="9.5" x2="19.5" y2="4.5" />
        <line x1="9.5" y1="14.5" x2="4.5" y2="19.5" />
        {/* Nodos secundarios */}
        <circle cx="12" cy="3" r="1" fill="white" stroke="white" />
        <circle cx="12" cy="21" r="1" fill="white" stroke="white" />
        <circle cx="3" cy="12" r="1" fill="white" stroke="white" />
        <circle cx="21" cy="12" r="1" fill="white" stroke="white" />
        <circle cx="4.5" cy="4.5" r="1" fill="white" stroke="white" />
        <circle cx="19.5" cy="19.5" r="1" fill="white" stroke="white" />
        <circle cx="19.5" cy="4.5" r="1" fill="white" stroke="white" />
        <circle cx="4.5" cy="19.5" r="1" fill="white" stroke="white" />
      </svg>
    </div>
  );
};

export default App_logo;
