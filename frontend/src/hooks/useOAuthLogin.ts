import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { oauthService, OAuthProvider } from '@/services/oauthService';

/**
 * Hook para gerenciar autenticação OAuth
 * 
 * Funcionalidades:
 * - Iniciar login OAuth
 * - Processar callback OAuth
 * - Gerenciar estado de loading e erros
 */
export const useOAuthLogin = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inicia o fluxo de login com Google
   */
  const loginWithGoogle = () => {
    setError(null);
    oauthService.initiateGoogleLogin();
  };

  /**
   * Processa o callback OAuth
   * Deve ser chamado quando a URL contém o código de autorização
   */
  const processOAuthCallback = async (provider: OAuthProvider) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Verifica se há erro na URL (usuário cancelou)
      const urlError = oauthService.getErrorFromUrl();
      if (urlError) {
        throw new Error('Autenticação cancelada pelo usuário');
      }

      // Obtém o código da URL
      const code = oauthService.getCodeFromUrl();
      if (!code) {
        throw new Error('Código de autorização não encontrado');
      }

      // Envia o código para o backend
      const response = await oauthService.handleCallback(provider, code);

      // Salva o token
      localStorage.setItem('access_token', response.accessToken);

      // Limpa os parâmetros da URL
      oauthService.cleanUrlParams();

      // Redireciona para o dashboard
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Erro no OAuth:', err);
      
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Erro ao fazer login com Google';
      
      setError(errorMessage);
      
      // Limpa os parâmetros da URL mesmo em caso de erro
      oauthService.cleanUrlParams();
      
      // Redireciona de volta para o login
      navigate('/login', { state: { error: errorMessage } });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loginWithGoogle,
    processOAuthCallback,
    isProcessing,
    error,
  };
};
