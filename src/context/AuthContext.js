import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normaliseAuthToken } from '../services/apiClient';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem('token'), AsyncStorage.getItem('username')]).then(([t, u]) => {
      if (t) {
        const rawToken = normaliseAuthToken(t);
        setToken(rawToken);
        const decoded = decodeJwt(rawToken);
        setUserId(decoded?.user_id ?? null);
      }
      if (u) setUsername(u);
      setLoading(false);
    });
  }, []);

  const login = async (t, u) => {
    const rawToken = normaliseAuthToken(t);
    await AsyncStorage.multiSet([['token', rawToken], ['username', u ?? '']]);
    setToken(rawToken);
    const decoded = decodeJwt(rawToken);
    setUserId(decoded?.user_id ?? null);
    setUsername(u ?? null);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'username']);
    setToken(null);
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
