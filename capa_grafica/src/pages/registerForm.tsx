import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import App_logo from "../icons/app_logo";
import Spinner from "../components/spinner";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // 🔹 Validación de usuario: al menos 7 letras (incluyendo ñ y acentos) y 4 números, solo alfanuméricos y caracteres especiales permitidos (sin espacios)
    const usernameValue = formData.username;
    const letters = usernameValue.match(/[A-Za-záéíóúüñÑ]/g) || [];
    const digits = usernameValue.match(/\d/g) || [];
    const hasOnlyAllowed = /^[A-Za-záéíóúüñÑ\d]+$/.test(usernameValue); // solo letras y números

    if (!usernameValue) {
      newErrors.username = "El nombre de usuario es obligatorio";
    } else if (!hasOnlyAllowed) {
      newErrors.username = "Solo se permiten letras y números (sin espacios)";
    } else if (letters.length < 7) {
      newErrors.username = `Debe tener al menos 7 letras (tienes ${letters.length})`;
    } else if (digits.length < 4) {
      newErrors.username = `Debe tener al menos 4 números (tienes ${digits.length})`;
    }

    // 🔹 Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Debe ser un email válido";
    }

    // 🔹 Contraseña: misma regla que usuario (7 letras + 4 números)
    const passValue = formData.password;
    const passLetters = passValue.match(/[A-Za-záéíóúüñÑ]/g) || [];
    const passDigits = passValue.match(/\d/g) || [];
    const passOnlyAllowed = /^[A-Za-záéíóúüñÑ\d]+$/.test(passValue);

    if (!passValue) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (!passOnlyAllowed) {
      newErrors.password = "Solo se permiten letras y números (sin espacios)";
    } else if (passLetters.length < 7) {
      newErrors.password = `Debe tener al menos 7 letras (tienes ${passLetters.length})`;
    } else if (passDigits.length < 4) {
      newErrors.password = `Debe tener al menos 4 números (tienes ${passDigits.length})`;
    }

    // 🔹 Confirmar contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          "Cuenta creada exitosamente. Redirigiendo al login...",
        );
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrors({
          general: data.message || "Error al registrar usuario",
        });
      }
    } catch (error) {
      console.error("Error en registro:", error);
      setErrors({
        general: "Error de conexión con el servidor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden px-4 py-8">
      {/* Fondos y efectos decorativos */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      {/* Tarjeta principal */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl shadow-indigo-500/10 my-4">
        <App_logo />
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-center tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Crear cuenta
        </h1>
        <p className="text-sm sm:text-base mb-6 text-center text-gray-300">
          Regístrate para comenzar a gestionar tus billeteras XRP.
        </p>

        {successMessage && (
          <div className="w-full mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Nombre de usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej: juanperez1234"
              className={`w-full p-3 rounded-xl bg-white/10 border ${
                errors.username ? "border-red-500" : "border-white/10"
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
            />
            {errors.username && (
              <p className="mt-1 text-red-400 text-xs">{errors.username}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className={`w-full p-3 rounded-xl bg-white/10 border ${
                errors.email ? "border-red-500" : "border-white/10"
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Campo Contraseña con ojo */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 7 letras y 4 números"
                className={`w-full p-3 pr-12 rounded-xl bg-white/10 border ${
                  errors.password ? "border-red-500" : "border-white/10"
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-red-400 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Campo Confirmar Contraseña con ojo */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={`w-full p-3 pr-12 rounded-xl bg-white/10 border ${
                  errors.confirmPassword ? "border-red-500" : "border-white/10"
                } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-red-400 text-xs">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 text-white font-semibold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner />
                Registrando...
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="w-full h-px bg-white/10 my-6"></div>

        <p className="text-sm text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>

        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
          Conexión segura
        </div>
      </div>
    </div>
  );
};

export default Register;
