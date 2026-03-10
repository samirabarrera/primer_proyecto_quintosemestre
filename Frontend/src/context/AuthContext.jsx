import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Proveedor de autenticación. Envuelve toda la app en App.jsx.
 * Guarda el usuario en state y en localStorage para persistencia.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    });

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook para acceder al contexto de auth en cualquier componente. */
export function useAuth() {
    return useContext(AuthContext);
}
