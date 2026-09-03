import { Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import ProtectedRoute from './components/protected_route';

function App() {
  return (
    <Routes>
      {/* Ruta pública: Login */}
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        {/* Aquí puedes agregar más rutas protegidas, ej: /dashboard, /settings */}
      </Route>
    </Routes>
  );
}

export default App;