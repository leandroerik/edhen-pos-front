import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext - Maneja la autenticación y el usuario logeado
 * Proporciona información del usuario actual en toda la aplicación
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulamos la carga del usuario desde localStorage o API
  useEffect(() => {
    // Usuario por defecto hardcodeado
    const defaultUser = {
      id: 1,
      email: 'usuario@edhen.com',
      name: 'Usuario Genérico',
      role: 'admin', // 'vendedor' | 'admin'
      avatar: 'https://ui-avatars.com/api/?name=Usuario+Generico'
    };
    
    setUser(defaultUser);
    setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    // Redirigir a login en producción
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isVendedor: user?.role === 'vendedor'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
