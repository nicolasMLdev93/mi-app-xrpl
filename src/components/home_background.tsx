const home_background = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Textura de cubos (sutil) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

      {/* Burbujas animadas con baja opacidad */}
      <div className="absolute inset-0">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
      </div>

      {/* Estilos de las burbujas */}
      <style>{`
          .bubble {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.15;
            animation: float 20s ease-in-out infinite alternate;
          }
          .bubble-1 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle at 30% 30%, #818cf8, #7c3aed);
            top: -5%;
            left: -5%;
            animation-duration: 22s;
            animation-delay: 0s;
          }
          .bubble-2 {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle at 70% 30%, #a78bfa, #6d28d9);
            bottom: -10%;
            right: -5%;
            animation-duration: 26s;
            animation-delay: -3s;
          }
          .bubble-3 {
            width: 250px;
            height: 250px;
            background: radial-gradient(circle at 60% 60%, #f472b6, #db2777);
            top: 30%;
            left: 40%;
            animation-duration: 28s;
            animation-delay: -6s;
          }
          .bubble-4 {
            width: 200px;
            height: 200px;
            background: radial-gradient(circle at 20% 80%, #34d399, #059669);
            bottom: 20%;
            left: 10%;
            animation-duration: 24s;
            animation-delay: -2s;
          }
          .bubble-5 {
            width: 350px;
            height: 350px;
            background: radial-gradient(circle at 80% 80%, #60a5fa, #2563eb);
            top: -15%;
            right: 20%;
            animation-duration: 30s;
            animation-delay: -8s;
          }
          @keyframes float {
            0% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            33% {
              transform: translate(30px, -40px) scale(1.1) rotate(5deg);
            }
            66% {
              transform: translate(-20px, 30px) scale(0.9) rotate(-3deg);
            }
            100% {
              transform: translate(40px, 20px) scale(1.05) rotate(4deg);
            }
          }
        `}</style>
    </div>
  );
};

export default home_background;
