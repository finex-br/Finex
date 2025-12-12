import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Cliente HTTP base configurado para a API do FinEx
 * 
 * Features:
 * - BaseURL configurável via variável de ambiente
 * - Autenticação automática via Bearer Token
 * - Tratamento de token expirado (401)
 */

// Configuração da BaseURL
// Use /api/ para proxy reverso no Nginx, ou URL completa em desenvolvimento
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

    // Se o token existir, adiciona no header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Verifica se o erro é 401 Unauthorized (token expirado/inválido)
    if (error.response?.status === 401) {
      // Limpa todos os dados de autenticação do localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Redireciona para a página de login
      // Usamos window.location.href pois funciona melhor em interceptors
      window.location.href = '/login';
    }

    // Propaga o erro para ser tratado onde a requisição foi chamada
    return Promise.reject(error);
  }
);
