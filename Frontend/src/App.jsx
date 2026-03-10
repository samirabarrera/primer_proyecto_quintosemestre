import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import CrearTicket from './pages/CrearTicket';
import DetalleTicket from './pages/DetalleTicket';

/** Ruta protegida: redirige al login si no hay usuario logueado */
function RutaPrivada({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

/** Ruta solo para L1 */
function RutaSoloL1({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'level1') return <Navigate to="/" replace />;
    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login"   element={user ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/registro" element={user ? <Navigate to="/" replace /> : <Registro />} />

                {/* Rutas protegidas */}
                <Route path="/" element={<RutaPrivada><Dashboard /></RutaPrivada>} />
                <Route path="/tickets/nuevo" element={<RutaSoloL1><CrearTicket /></RutaSoloL1>} />
                <Route path="/tickets/:id"   element={<RutaPrivada><DetalleTicket /></RutaPrivada>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
