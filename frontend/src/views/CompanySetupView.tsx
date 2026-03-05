import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { companyService, CompanySummary } from '@/services/companyService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';

function getPostSetupRedirect(): string {
  const redirect = sessionStorage.getItem('finex-redirect-after-setup');
  if (redirect) {
    sessionStorage.removeItem('finex-redirect-after-setup');
    return redirect;
  }
  return '/dashboard';
}

export function CompanySetupView() {
  const navigate = useNavigate();
  const setCurrentCompany = useAuthStore((s) => s.setCurrentCompany);

  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [companies, setCompanies] = useState<CompanySummary[] | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const storedCompanyId = localStorage.getItem('current_company_id') || undefined;
      try {
        const me = await companyService.getMyCompany(storedCompanyId);

        if (me.company) {
          setCurrentCompany(me.company.id, me.company.name);
          navigate(getPostSetupRedirect(), { replace: true });
          return;
        }

        // No membership yet -> keep create flow
        setCompanies([]);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        const message = axiosError.response?.data?.message || '';

        if (axiosError.response?.status === 403) {
          localStorage.removeItem('current_company_id');
        }

        // Option B: if multiple companies, require explicit selection
        if (axiosError.response?.status === 400 && message.toLowerCase().includes('multiple companies')) {
          try {
            const list = await companyService.listMyCompanies();
            setCompanies(list.companies || []);

            if (list.companies?.length === 1) {
              setCurrentCompany(list.companies[0].id, list.companies[0].name);
              navigate(getPostSetupRedirect(), { replace: true });
              return;
            }
          } catch {
            setError('Erro ao carregar lista de empresas');
          }
          return;
        }

        // Otherwise: treat as no membership / other error
        setCompanies([]);
      }
    })();
  }, [navigate]);

  const handleSelectCompany = async () => {
    setError(null);

    if (!selectedCompanyId) {
      setError('Selecione uma empresa para continuar');
      return;
    }

    setIsLoading(true);
    try {
      // Validate membership by calling /companies/me with header
      const me = await companyService.getMyCompany(selectedCompanyId);
      if (!me.company) {
        setError('Empresa não encontrada para este usuário');
        return;
      }

      setCurrentCompany(me.company.id, me.company.name);
      navigate(getPostSetupRedirect(), { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || 'Erro ao selecionar empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await companyService.createCompany(companyName.trim());
      setSuccessMessage(result.message || 'Empresa criada com sucesso');
      setCurrentCompany(result.company.id, result.company.name);
      const redirect = getPostSetupRedirect();
      setTimeout(() => navigate(redirect, { replace: true }), 800);
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
              <CardTitle>
                {companies && companies.length > 1 ? 'Selecionar empresa' : 'Criar empresa'}
              </CardTitle>
              <CardDescription>
                {companies && companies.length > 1
                  ? 'Você tem mais de uma empresa. Selecione uma para continuar.'
                  : 'Para usar uploads e revisão de documentos, associe seu usuário a uma empresa.'}
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

              {companies && companies.length > 1 ? (
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Empresa</div>
                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSelectCompany}
                    disabled={isLoading || !selectedCompanyId}
                    className="w-full"
                  >
                    {isLoading ? 'Entrando...' : 'Continuar'}
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
