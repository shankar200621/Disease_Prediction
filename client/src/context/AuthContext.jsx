import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { authApi, setToken, getToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('hp_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      localStorage.removeItem('hp_user');
    }
    setReady(true);
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('hp_user', JSON.stringify(res.user));
    return res;
  };

  const register = async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('hp_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hp_user');
    localStorage.removeItem('hp_prediction');
  };

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: !!user && !!getToken(),
      login,
      register,
      logout,
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
