/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useLoginViewModel } from './useLoginViewModel';
import { authService } from '@/services/authService';
import type { AuthResponse } from '@/services/authService';

// Mock do authService
vi.mock('@/services/authService', () => ({
  authService: {
    signIn: vi.fn(),
  },
}));

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useLoginViewModel', () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Limpa o localStorage após cada teste
  afterEach(() => {
    localStorage.clear();
  });

  describe('Estado Inicial', () => {
    it('deve iniciar com isLoading false, error null e formulário vazio', () => {
      const { result } = renderHook(() => useLoginViewModel());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.email).toBe('');
      expect(result.current.password).toBe('');
    });
  });

  describe('Login com Sucesso', () => {
    it('deve fazer login, salvar token no localStorage e navegar para /company/setup quando não há empresa selecionada', async () => {
      // Arrange: Preparar o mock de resposta
      const mockAuthResponse: AuthResponse = {
        token: 'fake-jwt-token-12345',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        },
      };

      vi.mocked(authService.signIn).mockResolvedValueOnce(mockAuthResponse);

      const { result } = renderHook(() => useLoginViewModel());

      // Act: Atualizar os campos do formulário
      act(() => {
        result.current.setEmail('john@example.com');
        result.current.setPassword('password123');
      });

      // Act: Submeter o formulário
      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as any);
      });

      // Assert: Verificar que o authService foi chamado corretamente
      expect(authService.signIn).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      });
      expect(authService.signIn).toHaveBeenCalledTimes(1);

      // Assert: Verificar que o token foi salvo no localStorage
      expect(localStorage.getItem('access_token')).toBe('fake-jwt-token-12345');

      // Assert: Verificar que navegou para /company/setup (sem current_company_id)
      expect(mockNavigate).toHaveBeenCalledWith('/company/setup', { replace: true });
      expect(mockNavigate).toHaveBeenCalledTimes(1);

      // Assert: Verificar que não há erro
      expect(result.current.error).toBeNull();
    });

    it('deve navegar para /dashboard quando já existe empresa selecionada', async () => {
      // Arrange
      localStorage.setItem('current_company_id', 'company-1');

      const mockAuthResponse: AuthResponse = {
        token: 'fake-jwt-token-12345',
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        },
      };

      vi.mocked(authService.signIn).mockResolvedValueOnce(mockAuthResponse);

      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.setEmail('john@example.com');
        result.current.setPassword('password123');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as any);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('deve salvar os dados do usuário no localStorage', async () => {
      // Arrange
      const mockAuthResponse: AuthResponse = {
        token: 'fake-token',
        user: {
          id: '1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'admin',
        },
      };

      vi.mocked(authService.signIn).mockResolvedValueOnce(mockAuthResponse);

      const { result } = renderHook(() => useLoginViewModel());

      // Act
      act(() => {
        result.current.setEmail('jane@example.com');
        result.current.setPassword('admin123');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as any);
      });

      // Assert: Verificar que os dados do usuário foram salvos
      const savedUser = localStorage.getItem('user');
      expect(savedUser).toBeTruthy();
      expect(JSON.parse(savedUser!)).toEqual(mockAuthResponse.user);
    });
  });

  describe('Login com Erro', () => {
    it('deve capturar erro, atualizar estado de erro e não navegar', async () => {
      // Arrange: Simular erro de autenticação
      const mockError = {
        response: {
          data: {
            message: 'Credenciais inválidas',
          },
          status: 401,
        },
      };

      vi.mocked(authService.signIn).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useLoginViewModel());

      // Act
      act(() => {
        result.current.setEmail('wrong@example.com');
        result.current.setPassword('wrongpassword');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as any);
      });

      // Assert: Verificar que o erro foi capturado e atualizado
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Credenciais inválidas');

      // Assert: Verificar que não navegou
      expect(mockNavigate).not.toHaveBeenCalled();

      // Assert: Verificar que não salvou token
      expect(localStorage.getItem('access_token')).toBeNull();

      // Assert: Verificar que isLoading voltou para false
      expect(result.current.isLoading).toBe(false);
    });

    it('deve mostrar mensagem genérica quando erro não tem response', async () => {
      // Arrange: Simular erro de rede
      const networkError = new Error('Network Error');

      vi.mocked(authService.signIn).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useLoginViewModel());

      // Act
      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('test123');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as any);
      });

      // Assert: Verificar mensagem de erro genérica
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Erro ao fazer login');
    });
  });

  describe('Loading State', () => {
    it('deve definir isLoading como true durante a requisição', async () => {
      // Arrange: Criar uma Promise que podemos controlar
      let resolveSignIn: (value: AuthResponse) => void;
      const signInPromise = new Promise<AuthResponse>((resolve) => {
        resolveSignIn = resolve;
      });

      vi.mocked(authService.signIn).mockReturnValueOnce(signInPromise);

      const { result } = renderHook(() => useLoginViewModel());

      // Act: Iniciar o submit
      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('test123');
      });

      // Act: Chamar handleSubmit sem aguardar
      act(() => {
        result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as any);
      });

      // Assert: Verificar que isLoading está true durante a requisição
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Cleanup: Resolver a Promise para não deixar pendente
      act(() => {
        resolveSignIn!({
          token: 'test-token',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
          },
        });
      });

      // Assert: Verificar que isLoading volta para false após conclusão
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('deve definir isLoading como false após erro', async () => {
      // Arrange
      vi.mocked(authService.signIn).mockRejectedValueOnce(
        new Error('Login failed')
      );

      const { result } = renderHook(() => useLoginViewModel());

      // Act
      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('test123');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as any);
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Atualização de Campos', () => {
    it('deve atualizar o email quando setEmail é chamado', () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.setEmail('newemail@example.com');
      });

      expect(result.current.email).toBe('newemail@example.com');
    });

    it('deve atualizar a senha quando setPassword é chamado', () => {
      const { result } = renderHook(() => useLoginViewModel());

      act(() => {
        result.current.setPassword('newpassword123');
      });

      expect(result.current.password).toBe('newpassword123');
    });
  });

  describe('Validação de Formulário', () => {
    it('deve prevenir o comportamento padrão do formulário', async () => {
      const mockAuthResponse: AuthResponse = {
        token: 'test-token',
        user: {
          id: '1',
          name: 'Test',
          email: 'test@example.com',
          role: 'user',
        },
      };

      vi.mocked(authService.signIn).mockResolvedValueOnce(mockAuthResponse);

      const { result } = renderHook(() => useLoginViewModel());
      const mockEvent = {
        preventDefault: vi.fn(),
      } as any;

      act(() => {
        result.current.setEmail('test@example.com');
        result.current.setPassword('test123');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });
});
