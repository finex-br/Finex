import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLoginViewModel } from '@/hooks/useLoginViewModel';
import { useOAuthLogin } from '@/hooks/useOAuthLogin';

/**
 * LoginView - Componente Presentacional (Dumb Component)
 * 
 * Responsabilidades:
 * - Renderizar a interface de login
 * - Capturar inputs do usuário
 * - Exibir feedback visual (loading, erros)
 * 
 * Toda a lógica de negócio está no useLoginViewModel (ViewModel)
 */
export function LoginView() {
  // Obtém estado e handlers do ViewModel
  const {
    email,
    password,
    setEmail,
    setPassword,
    handleSubmit,
    isLoading,
    error,
  } = useLoginViewModel();

  // Hook para login OAuth
  const { loginWithGoogle } = useOAuthLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-orange-600">
            FinEx
          </CardTitle>
          <CardDescription className="text-base">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="email"
              />
            </div>

            {/* Campo de Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="current-password"
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Botão de Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* OAuth DESABILITADO - Apenas login com email/senha */}

          {/* Link adicional (opcional) */}
          <div className="mt-4 text-center text-sm text-slate-600">
            <p>
              Não tem uma conta?{' '}
              <Link 
                to="/signup" 
                className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
