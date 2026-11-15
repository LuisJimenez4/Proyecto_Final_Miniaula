import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { navigateTo } from '../config/navigationRef';
import { setUnauthorizedHandler } from '../config/axiosClient';
import { getToken, getStoredUser, saveSession, saveUser, clearSession } from '../config/session';

export const AuthContext = createContext(null);

/** RT-F02: usuario y token en Context; la sesión sobrevive a recargar porque se lee de localStorage. */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback((newToken, newUser) => {
    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    navigateTo('/login', { replace: true });
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      saveUser(merged);
      return merged;
    });
  }, []);

  // RT-F03: un 401 de la API cierra la sesión en almacenamiento y en pantalla.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({ user, token, isLoggedIn: Boolean(token), login, logout, updateUser }),
    [user, token, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
