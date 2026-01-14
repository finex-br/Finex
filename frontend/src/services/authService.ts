import { api } from '@/services/api';

/**
 * DTOs (Data Transfer Objects) para autenticação
 * Interfaces compatíveis com o backend NestJS
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  cnpj: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

/**
 * Serviço de Autenticação
 * 
 * Responsável por gerenciar todas as operações relacionadas à autenticação
 * utilizando o cliente HTTP configurado.
 */
export const authService = {
  /**
   * Realiza o login do usuário
   * 
   * @param credentials - Credenciais de login (email e senha)
   * @returns Promise com o token de autenticação e dados do usuário
   * @throws AxiosError - Erros de rede ou validação da API
   */
  signIn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/sign-in', credentials);
    return response.data;
  },

  /**
   * Realiza o cadastro de um novo usuário
   * 
   * @param data - Dados do usuário para cadastro
   * @returns Promise com o token de autenticação
   * @throws AxiosError - Erros de rede ou validação da API
   */
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/sign-up', data);
    return response.data;
  },
};
