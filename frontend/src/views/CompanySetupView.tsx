import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { companyService } from '@/services/companyService';

export function CompanySetupView() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await companyService.getMyCompany();
        if (me.company) {
          navigate('/upload', { replace: true });
        }
      } catch {
        // ignore; user might not have membership yet
      }
    })();
  }, [navigate]);

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await companyService.createCompany(companyName.trim());
      setSuccessMessage(result.message || 'Empresa criada com sucesso');
      setTimeout(() => navigate('/upload', { replace: true }), 800);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao criar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Criar empresa</CardTitle>
              <CardDescription>
                Para usar uploads e revisão de documentos, associe seu usuário a uma empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium">Nome da empresa</div>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Minha Empresa LTDA"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={isLoading || companyName.trim().length === 0}
                className="w-full"
              >
                {isLoading ? 'Criando...' : 'Criar e continuar'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
