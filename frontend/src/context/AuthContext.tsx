import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '../types';
import { apiClient } from '../api/apiClient';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (user: any) => {
  if (!user) return user;
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
  return { ...user, role: roleName || 'Driver' };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Verify auth session on initial load or mount (to handle page refreshes)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await apiClient.get('/auth/profile');
        const user = normalizeUser(response.data.data);

        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err) {
        localStorage.removeItem('accessToken');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();

    // Listen to global logout requests from Axios interceptor on refresh failure
    const handleGlobalLogout = () => {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener('auth:logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, tokens, user: rawUser } = response.data.data;
      const accessToken = token || tokens?.accessToken;
      const user = normalizeUser(rawUser);

      localStorage.setItem('accessToken', accessToken);
      setState({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on backend:', err);
    } finally {
      localStorage.removeItem('accessToken');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
