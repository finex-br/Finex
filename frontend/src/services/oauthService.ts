import { api } from '@/services/api';

/**
 * DTOs para OAuth
 */
export interface OAuthCallbackRequest {
  code: string;
  redirectUri?: string;
}

export interface OAuthResponse {
  accessToken: string;
  userId: string;
  email: string;
  isNewUser: boolean;
}

/**
 * Tipos de provedores OAuth suportados
 */
export type OAuthProvider = 'google' | 'github' | 'facebook';

/**
 * Configuração OAuth do Google
 */
const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/google/callback`,
  scope: 'openid profile email',
  responseType: 'code',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
};

/**
 * Serviço de Autenticação OAuth
 * 
 * Gerencia o fluxo OAuth 2.0 com provedores sociais
 */
export const oauthService = {
  /**
   * Inicia o fluxo OAuth com Google
   * Redireciona o usuário para a página de autorização do Google
   */
  initiateGoogleLogin: (): void => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: GOOGLE_CONFIG.responseType,
      scope: GOOGLE_CONFIG.scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `${GOOGLE_CONFIG.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
  },

  /**
   * Processa o callback OAuth
   * Envia o código de autorização para o backend e recebe o token
   * 
   * @param provider - Provedor OAuth (google, github, etc)
   * @param code - Código de autorização recebido do provedor
   * @param redirectUri - URI de redirecionamento usado na autorização
   * @returns Promise com os dados de autenticação
   */
  handleCallback: async (
    provider: OAuthProvider,
    code: string,
    redirectUri?: string
  ): Promise<OAuthResponse> => {
    const response = await api.post<OAuthResponse>(
      `/auth/oauth/${provider}/callback`,
      {
        code,
        redirectUri: redirectUri || GOOGLE_CONFIG.redirectUri,
      }
    );
    
    return response.data;
  },

  /**
   * Obtém o código de autorização da URL atual
   * Útil para processar callbacks OAuth
   * 
   * @returns Código de autorização ou null se não encontrado
   */
  getCodeFromUrl: (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
  },

  /**
   * Obtém o erro da URL (caso o usuário cancele a autorização)
   * 
   * @returns Mensagem de erro ou null
   */
  getErrorFromUrl: (): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get('error');
  },

  /**
   * Limpa os parâmetros OAuth da URL
   */
  cleanUrlParams: (): void => {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('error');
    window.history.replaceState({}, document.title, url.pathname);
  },
};
