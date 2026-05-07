import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from './AuthContext';
import { api } from '../services/api';
import { handleApiError } from '@/utils/handleApiError';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize loading as false since localStorage is read synchronously during state init
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando ou executando a lógica de validação inicial
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('@MyClub:token');
        if (token) {
          // Opcional: Você poderia fazer uma chamada /me aqui para validar o token
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        alert(error);
        logout();
      } finally {
        // ESSENCIAL: Finaliza o loading independente do resultado
        setLoading(false);
      }
    };

    checkAuth();

    const handleLogout = () => logout();
    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  const [user, setUser] = useState<User | null>(() => {
    // Attempt to restore user data from local storage on init
    const savedUser = localStorage.getItem('@MyClub:user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    // Check for existing access token
    const token = localStorage.getItem('@MyClub:token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      return true;
    }
    return false;
  });

  // Clear all session data and reset state
  function logout() {
    localStorage.removeItem('@MyClub:token');
    localStorage.removeItem('@MyClub:refreshToken');
    localStorage.removeItem('@MyClub:user');

    delete api.defaults.headers.common['Authorization'];

    setUser(null);
    setAuthenticated(false);
  }

  // Handle user authentication and token storage
  async function login(email: string, password: string) {
    try {
      const { data } = await api.post('/users/login', { email, password });

      const userPayload: User = {
        name: data.name,
        email: email,
        avatar: data.avatar || '/avatars/shadcn.jpg',
      };

      // Store both access and refresh tokens
      localStorage.setItem('@MyClub:token', data.token);
      localStorage.setItem('@MyClub:refreshToken', data.refreshToken);
      localStorage.setItem('@MyClub:user', JSON.stringify(userPayload));

      // Apply access token to all future api requests
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

      setUser(userPayload);
      setAuthenticated(true);
    } catch (err) {
      handleApiError(err, 'Falha ao realizar login.');
      throw err;
    }
  }

  useEffect(() => {
    // Listen for the custom logout event triggered by the axios interceptor
    const handleLogout = () => {
      logout();
    };

    window.addEventListener('logout', handleLogout);

    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{ authenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
