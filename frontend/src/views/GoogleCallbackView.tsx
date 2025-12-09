import { useEffect } from 'react';
import { useOAuthLogin } from '@/hooks/useOAuthLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * GoogleCallbackView - Página de callback do Google OAuth
 * 
 * Esta página é acessada após o usuário autorizar o app no Google.
 * Processa o código de autorização e faz login automaticamente.
 */
export function GoogleCallbackView() {
  const { processOAuthCallback, isProcessing, error } = useOAuthLogin();

  useEffect(() => {
    // Processa o callback assim que a página carregar
    processOAuthCallback('google');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-orange-600">
            FinEx
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          {isProcessing && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
              <p className="text-center text-slate-600">
                Autenticando com Google...
              </p>
              <p className="text-center text-sm text-slate-500">
                Aguarde um momento
              </p>
            </>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-sm text-slate-500 mt-2">
                Redirecionando para o login...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
