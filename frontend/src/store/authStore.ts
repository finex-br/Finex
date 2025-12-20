import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User interface (alinhado com backend)
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * AuthStore - Estado Global de Autenticação
 * 
 * Usa Zustand para gerenciar APENAS:
 * - Token de autenticação
 * - Dados do usuário
 * - Empresa atual (currentCompanyId)
 * 
 * NÃO contém lógica de negócio (apenas estado global).
 */
interface AuthStore {
  // State
  token: string | null;
  user: User | null;
  currentCompanyId: string | null;

  // Actions
  setAuth: (token: string, user: User) => void;
  setCurrentCompanyId: (companyId: string) => void;
  clearAuth: () => void;

  // Helpers
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      currentCompanyId: null,

      // Set authentication data
      setAuth: (token: string, user: User) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user });
      },

      // Set current company
      setCurrentCompanyId: (companyId: string) => {
        set({ currentCompanyId: companyId });
      },

      // Clear authentication (logout)
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
        set({ token: null, user: null, currentCompanyId: null });
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },
    }),
    {
      name: 'auth-storage', // Nome no localStorage
      partialize: (state) => ({
        // Persiste apenas token e user (não o currentCompanyId)
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
