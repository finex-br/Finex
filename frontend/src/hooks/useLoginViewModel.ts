import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, LoginCredentials } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { AxiosError } from 'axios';

/**
 * Interface de retorno do hook useLoginViewModel
 */
interface UseLoginViewModelReturn {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom Hook - ViewModel para a tela de Login
 * 
 * Implementa o padrão MVVM, encapsulando toda a lógica de negócio
 * e gerenciamento de estado da tela de login.
 * 
 * @returns {UseLoginViewModelReturn} Estado e handlers para o formulário de login
 * 
 * @example
 * const { email, password, setEmail, setPassword, handleSubmit, isLoading, error } = useLoginViewModel();
 */
export const useLoginViewModel = (): UseLoginViewModelReturn => {
  // Estados do formulário
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Estados de UI
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hook de navegação do React Router
  const navigate = useNavigate();

  // Zustand store para autenticação
  const { setAuth } = useAuthStore();

  /**
   * Handler do submit do formulário de login
   * 
   * Fluxo:
   * 1. Previne comportamento padrão do formulário
   * 2. Valida campos obrigatórios
   * 3. Ativa estado de loading
   * 4. Chama API de autenticação
   * 5. Em caso de sucesso: salva token e redireciona
   * 6. Em caso de erro: exibe mensagem amigável
   * 7. Sempre desativa loading no final
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    // Limpa erro anterior
    setError(null);

    // Validação básica
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    // Inicia estado de loading
    setIsLoading(true);

    try {
      // Prepara as credenciais
      const credentials: LoginCredentials = {
        email: email.trim(),
        password: password.trim(),
      };

      // Chama o serviço de autenticação
      const response = await authService.signIn(credentials);

      // Debug: verificar o que está sendo retornado
      console.log('🔐 Login Response:', response);
      console.log('👤 User data:', response.user);
      console.log('🎭 User role:', response.user.role);

      // Salva autenticação no store (localStorage + Zustand)
      setAuth(response.token, response.user);

      // Redireciona para dashboard após login
      navigate('/dashboard');
    } catch (err) {
      // Tratamento de erro com mensagem amigável
      const axiosError = err as AxiosError<{ message?: string }>;

      if (axiosError.response?.data?.message) {
        // Usa a mensagem do backend se disponível
        setError(axiosError.response.data.message);
      } else if (axiosError.response) {
        // Erro HTTP genérico
        setError('Credenciais inválidas. Verifique seu email e senha.');
      } else {
        // Erro de rede ou outro erro
        setError('Erro ao fazer login. Verifique sua conexão e tente novamente.');
      }
    } finally {
      // Sempre desativa o loading, mesmo em caso de erro
      setIsLoading(false);
    }
  };

  // Retorna o contrato do ViewModel
  return {
    email,
    password,
    setEmail,
    setPassword,
    handleSubmit,
    isLoading,
    error,
  };
};
