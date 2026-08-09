import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    api.setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    api.onUnauthorized = logout;
    api.post('/auth/refresh')
      .then((data) => {
        api.setAccessToken(data.accessToken);
        return api.get('/auth/me');
      })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    api.setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
