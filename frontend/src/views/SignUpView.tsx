import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSignUpViewModel } from '@/hooks/useSignUpViewModel';
import { useOAuthLogin } from '@/hooks/useOAuthLogin';

/**
 * SignUpView - Componente Presentacional (Dumb Component)
 * 
 * Responsabilidades:
 * - Renderizar a interface de cadastro
 * - Capturar inputs do usuário
 * - Exibir feedback visual (loading, erros)
 * 
 * Toda a lógica de negócio está no useSignUpViewModel (ViewModel)
 */
export function SignUpView() {
  // Obtém estado e handlers do ViewModel
  const {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
  } = useSignUpViewModel();

  // Hook para login OAuth
  const { loginWithGoogle } = useOAuthLogin();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-orange-600">
            FinEx
          </CardTitle>
          <CardDescription className="text-base">
            Crie sua conta para começar
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Campo de Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="name"
              />
            </div>

            {/* Campo de Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="email"
              />
            </div>

            {/* Campo de Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Telefone
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(11) 98765-4321"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="tel"
              />
              <p className="text-xs text-slate-500">
                Com DDD: (11) 98765-4321 ou 11987654321
              </p>
            </div>

            {/* Campo de Nome da Empresa */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                Nome da Empresa
              </Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Minha Empresa LTDA"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="organization"
              />
            </div>

            {/* Campo de CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm font-medium">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                type="text"
                placeholder="12.345.678/0001-90"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Formato: 12.345.678/0001-90
              </p>
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
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-500">
                Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial
              </p>
            </div>

            {/* Campo de Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="new-password"
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
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* OAuth DESABILITADO - Apenas cadastro com email/senha */}

          {/* Link para Login */}
          <div className="mt-4 text-center text-sm text-slate-600">
            <p>
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
