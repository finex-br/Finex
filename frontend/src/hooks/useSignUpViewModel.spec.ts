import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSignUpViewModel } from './useSignUpViewModel';
import { authService } from '../services/authService';

// Mock do authService
vi.mock('../services/authService', () => ({
  authService: {
    signUp: vi.fn(),
    signIn: vi.fn(),
  },
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useSignUpViewModel', () => {
  const validPassword = 'Senha123!';
  let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  it('deve inicializar com estado correto', () => {
    const { result } = renderHook(() => useSignUpViewModel());

    expect(result.current.formData).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      companyName: '',
      cnpj: '',
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve atualizar os campos do formulário', () => {
    const { result } = renderHook(() => useSignUpViewModel());

    act(() => {
      result.current.handleChange('name', 'João Silva');
    });

    expect(result.current.formData.name).toBe('João Silva');

    act(() => {
      result.current.handleChange('email', 'joao@example.com');
    });

    expect(result.current.formData.email).toBe('joao@example.com');
  });

  describe('Validação', () => {
    it('deve retornar erro se as senhas não coincidirem', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', 'Senha123?');
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('As senhas não coincidem');
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('deve retornar erro se o nome estiver vazio', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', '');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Todos os campos são obrigatórios');
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('deve retornar erro se o email estiver vazio', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', '');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Todos os campos são obrigatórios');
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('deve retornar erro se a senha estiver vazia', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', '');
        result.current.handleChange('confirmPassword', '');
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Todos os campos são obrigatórios');
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('deve retornar erro se o telefone estiver vazio', async () => {
      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Todos os campos são obrigatórios');
      expect(authService.signUp).not.toHaveBeenCalled();
    });
  });

  describe('Cadastro com Sucesso', () => {
    it('deve chamar authService.signUp com os dados corretos', async () => {
      const mockToken = 'mock-jwt-token';
      vi.mocked(authService.signUp).mockResolvedValue({
        token: mockToken,
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'USER',
        },
      });

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(authService.signUp).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@example.com',
        password: validPassword,
        phoneNumber: '11999999999',
        companyName: 'Empresa LTDA',
        cnpj: '12345678000199',
      });
    });

    it('deve salvar o token no localStorage', async () => {
      const mockToken = 'mock-jwt-token';
      vi.mocked(authService.signUp).mockResolvedValue({
        token: mockToken,
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'USER',
        },
      });

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBe(mockToken);
      });
    });

    it('deve redirecionar para /upload após cadastro bem-sucedido', async () => {
      const mockToken = 'mock-jwt-token';
      vi.mocked(authService.signUp).mockResolvedValue({
        token: mockToken,
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'USER',
        },
      });

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/upload');
      });
    });

    it('deve definir isLoading como true durante o cadastro', async () => {
      const mockToken = 'mock-jwt-token';
      vi.mocked(authService.signUp).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  token: mockToken,
                  user: {
                    id: '1',
                    name: 'João Silva',
                    email: 'joao@example.com',
                    role: 'USER',
                  },
                }),
              100,
            );
          })
      );

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.handleSubmit();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await submitPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Cadastro com Erro', () => {
    it('deve capturar erro da API e exibir mensagem', async () => {
      const errorMessage = 'Email já cadastrado';
      vi.mocked(authService.signUp).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem genérica se o erro não tiver mensagem', async () => {
      vi.mocked(authService.signUp).mockRejectedValue({});

      const { result } = renderHook(() => useSignUpViewModel());

      act(() => {
        result.current.handleChange('name', 'João Silva');
        result.current.handleChange('email', 'joao@example.com');
        result.current.handleChange('password', validPassword);
        result.current.handleChange('confirmPassword', validPassword);
        result.current.handleChange('phoneNumber', '11999999999');
        result.current.handleChange('companyName', 'Empresa LTDA');
        result.current.handleChange('cnpj', '12345678000199');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe('Erro ao criar conta. Tente novamente.');
    });
  });
});
