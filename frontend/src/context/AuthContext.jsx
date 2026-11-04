import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Optimistic boot from cached token; /me trims it if the session is dead.
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sneaklab-user')) || (getToken() ? { role: 'user' } : null);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return setLoading(false);
    api('/api/auth/me')
      .then((d) => {
        setUser(d.user);
        localStorage.setItem('sneaklab-user', JSON.stringify(d.user));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const persist = (d) => {
    setToken(d.token);
    setUser(d.user);
    localStorage.setItem('sneaklab-user', JSON.stringify(d.user));
  };

  const login = async (email, password) => {
    const d = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    persist(d);
    return d.user;
  };

  const register = async (name, email, password) => {
    const d = await api('/api/auth/register', { method: 'POST', body: { name, email, password } });
    persist(d);
    return d.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sneaklab-user');
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      loading,
    }),
    [user, loading] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
