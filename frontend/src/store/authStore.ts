import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as Sentry from '@sentry/react';

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
 * - Empresa atual (currentCompanyId + currentCompanyName)
 *
 * NÃO contém lógica de negócio (apenas estado global).
 */
interface AuthStore {
  // State
  token: string | null;
  user: User | null;
  currentCompanyId: string | null;
  currentCompanyName: string | null;

  // Actions
  setAuth: (token: string, user: User) => void;
  setCurrentCompany: (companyId: string, companyName: string) => void;
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
      currentCompanyName: null,

      // Set authentication data
      setAuth: (token: string, user: User) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user });
        Sentry.setUser({ id: user.id, email: user.email, username: user.name });
      },

      // Set current company (id + name)
      setCurrentCompany: (companyId: string, companyName: string) => {
        localStorage.setItem('current_company_id', companyId);
        localStorage.setItem('current_company_name', companyName);
        set({ currentCompanyId: companyId, currentCompanyName: companyName });
      },

      // Clear authentication (logout)
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_company_id');
        localStorage.removeItem('current_company_name');
        set({ token: null, user: null, currentCompanyId: null, currentCompanyName: null });
        Sentry.setUser(null);
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
        token: state.token,
        user: state.user,
        currentCompanyId: state.currentCompanyId,
        currentCompanyName: state.currentCompanyName,
      }),
    },
  ),
);
