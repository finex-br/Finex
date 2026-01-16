import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/authStore';

/**
 * Interface para os dados do formulário de cadastro
 */
export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  companyName: string;
  cnpj: string;
}

/**
 * Hook personalizado para gerenciar a lógica de cadastro (Sign Up)
 * 
 * Este hook implementa:
 * - Gerenciamento de estado do formulário
 * - Validação de campos
 * - Chamada à API de cadastro
 * - Tratamento de erros
 * - Redirecionamento após sucesso
 * 
 * @returns Objeto contendo estado e funções do view model
 */
export const useSignUpViewModel = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    companyName: '',
    cnpj: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Atualiza um campo específico do formulário
   * 
   * @param field - Nome do campo a ser atualizado
   * @param value - Novo valor do campo
   */
  const handleChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpa o erro quando o usuário começa a digitar
    if (error) {
      setError(null);
    }
  };

  /**
   * Valida os dados do formulário
   * 
   * @returns true se os dados são válidos, false caso contrário
   */
  const validateForm = (): boolean => {
    // Verifica se todos os campos estão preenchidos
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.companyName.trim() ||
      !formData.cnpj.trim()
    ) {
      setError('Todos os campos são obrigatórios');
      return false;
    }

    // Valida nome (mínimo 2 caracteres)
    if (formData.name.trim().length < 2) {
      setError('Nome deve ter no mínimo 2 caracteres');
      return false;
    }

    // Valida nome da empresa (mínimo 3 caracteres)
    if (formData.companyName.trim().length < 3) {
      setError('Nome da empresa deve ter no mínimo 3 caracteres');
      return false;
    }

    // Valida telefone (10 ou 11 dígitos)
    const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError('Telefone inválido. Use formato: (11) 98765-4321');
      return false;
    }

    // Valida senha (mínimo 8 caracteres)
    if (formData.password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return false;
    }

    // Valida senha - Letra maiúscula
    if (!/[A-Z]/.test(formData.password)) {
      setError('Senha deve conter pelo menos uma letra maiúscula');
      return false;
    }

    // Valida senha - Letra minúscula
    if (!/[a-z]/.test(formData.password)) {
      setError('Senha deve conter pelo menos uma letra minúscula');
      return false;
    }

    // Valida senha - Número
    if (!/\d/.test(formData.password)) {
      setError('Senha deve conter pelo menos um número');
      return false;
    }

    // Valida senha - Caractere especial
    // eslint-disable-next-line no-useless-escape
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(formData.password)) {
      setError('Senha deve conter pelo menos um caractere especial (!@#$%...)');
      return false;
    }

    // Verifica se as senhas coincidem
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  /**
   * Submete o formulário de cadastro
   * 
   * Fluxo:
   * 1. Valida os dados
   * 2. Chama a API de cadastro
   * 3. Salva o token no localStorage
   * 4. Redireciona para a tela de upload (onboarding)
   */
  const handleSubmit = async (): Promise<void> => {
    // Validação
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Chama a API de cadastro (sem confirmPassword)
      const response = await authService.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        cnpj: formData.cnpj,
      });

      // Salva autenticação no store (localStorage + Zustand)
      // Backend retorna user também; usamos apenas o necessário para o store
      if (response.user) {
        setAuth(response.token, {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        });
      } else {
        // Fallback defensivo (não esperado): manter compatível com ProtectedRoute
        localStorage.setItem('access_token', response.token);
      }

      // Redireciona para a tela de upload (onboarding)
      navigate('/upload');
    } catch (err: unknown) {
      // Trata erros da API
      console.error('Erro ao fazer cadastro:', err);
      
      const error = err as { response?: { data?: { message?: string | string[] } } };
      
      // Extrai mensagem de erro do backend
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.response?.data?.message) {
        // Mensagem do backend NestJS
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    error,
    handleChange,
    handleSubmit,
  };
};
