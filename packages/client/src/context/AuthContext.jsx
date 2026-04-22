import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'taskflow_token';

function decodeToken(token) {
  try {
    const rawPayload = token.split('.')[1];
    const normalized = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    return saved ? decodeToken(saved) : null;
  });

  const login = (nextToken) => {
    localStorage.setItem('taskflow_token', nextToken);
    setToken(nextToken);
    setUser(decodeToken(nextToken));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
