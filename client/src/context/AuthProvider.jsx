import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.js';
import * as authService from '../services/authService.js';
import { setUnauthorizedHandler } from '../services/api.js';
import { clearToken, getToken, setToken } from '../utils/storage.js';
import { getErrorMessage } from '../utils/errors.js';
import { useToast } from '../hooks/useToast.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token exists we must verify it before deciding what to render.
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const navigate = useNavigate();
  const toast = useToast();

  // Runs whenever any API call returns 401 (expired/invalid token).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!getToken()) return; // already logged out (avoids duplicate toasts)
      clearToken();
      setUser(null);
      toast.error('Your session has expired. Please log in again.');
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate, toast]);

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    authService
      .getMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        // 401 is handled by the interceptor (session expired message).
        if (!cancelled && err?.response?.status !== 401) {
          toast.error(getErrorMessage(err, 'Unable to load your account. Please try again.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedIn, token } = await authService.login(email, password);
    setToken(token);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: created, token } = await authService.register(payload);
    setToken(token);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}