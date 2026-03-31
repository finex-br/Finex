import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/react';

/**
 * Cliente HTTP base configurado para a API do FinEx
 * 
 * Features:
 * - BaseURL configurável via variável de ambiente
 * - Autenticação automática via Bearer Token
 * - Tratamento de token expirado (401)
 */

// Configuração da BaseURL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Criação da instância do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Requisição
 * Adiciona automaticamente o token de autenticação se disponível
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Busca o token do localStorage
    const token = localStorage.getItem('access_token');
    const companyId = localStorage.getItem('current_company_id');

    // Se o token existir, adiciona no header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Se existir empresa selecionada, propaga para a API (multi-tenant)
    if (companyId) {
      config.headers['x-company-id'] = companyId;
    }

    return config;
  },
  (error) => {
    // Propaga o erro de requisição
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Resposta
 * Trata erros de autenticação (401) limpando o localStorage e redirecionando para login
 */
api.interceptors.response.use(
  (response) => {
    // Retorna a resposta normalmente se não houver erro
    return response;
  },
  (error: AxiosError) => {
    // Sentry: captura erros de servidor (5xx) e de rede
    if (error.response) {
      const status = error.response.status;
      if (status >= 500) {
        Sentry.captureException(error, {
          tags: {
            'http.status_code': String(status),
            'http.url': error.config?.url || 'unknown',
          },
        });
      } else {
        Sentry.addBreadcrumb({
          category: 'http',
          message: `${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status}`,
          level: status >= 400 ? 'warning' : 'info',
        });
      }
    } else if (error.request) {
      Sentry.captureException(error, {
        tags: { 'error.type': 'network' },
      });
    }

    // Verifica se o erro é 401 Unauthorized (token expirado/inválido)
    if (error.response?.status === 401) {
      // Limpa todos os dados de autenticação do localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('current_company_id');
      localStorage.removeItem('current_company_name');

      // Redireciona para a página de login
      // Usamos window.location.href pois funciona melhor em interceptors
      window.location.href = '/login';
    }

    // Se a API exigir seleção de empresa (multi-tenant), redireciona para setup
    if (error.response?.status === 400) {
      const data: any = error.response?.data;
      const message = typeof data?.message === 'string' ? data.message : '';
      const lower = message.toLowerCase();

      const looksLikeTenantSelectionError =
        lower.includes('multiple companies found') ||
        (lower.includes('x-company-id') && (lower.includes('required') || lower.includes('select')));

      if (looksLikeTenantSelectionError && window.location.pathname !== '/company/setup') {
        window.location.href = '/company/setup';
      }
    }

    // Se o usuário tentar acessar uma empresa que não pertence (ou não tem empresa),
    // limpamos a seleção atual para evitar loop e redirecionamos para setup.
    if (error.response?.status === 403) {
      const data: any = error.response?.data;
      const message = typeof data?.message === 'string' ? data.message : '';
      const lower = message.toLowerCase();

      const looksLikeInvalidCompanyContext =
        lower.includes('not associated with the selected company') ||
        lower.includes('not associated with any company') ||
        lower.includes('not a member of the requested company') ||
        (lower.includes('company') && lower.includes('not associated'));

      if (looksLikeInvalidCompanyContext) {
        localStorage.removeItem('current_company_id');
        localStorage.removeItem('current_company_name');

        if (window.location.pathname !== '/company/setup') {
          window.location.href = '/company/setup';
        }
      }
    }

    // Propaga o erro para ser tratado onde a requisição foi chamada
    return Promise.reject(error);
  }
);
