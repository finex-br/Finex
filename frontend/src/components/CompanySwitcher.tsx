import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronDown, Plus, Check, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { companyService, CompanySummary } from '@/services/companyService';
import { cn } from '@/lib/utils';

interface CompanySwitcherProps {
  isCollapsed: boolean;
}

export function CompanySwitcher({ isCollapsed }: CompanySwitcherProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentCompanyId, currentCompanyName, setCurrentCompany } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      companyService
        .listMyCompanies()
        .then((res) => setCompanies(res.companies))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setShowCreateForm(false);
      setNewCompanyName('');
      setCreateError(null);
    }
  }, [open]);

  const handleSwitch = (company: CompanySummary) => {
    if (company.id === currentCompanyId) {
      setOpen(false);
      return;
    }
    setCurrentCompany(company.id, company.name);
    queryClient.clear();
    setOpen(false);
    navigate('/dashboard');
  };

  const handleCreate = async () => {
    const name = newCompanyName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      const result = await companyService.createCompany(name);
      setCurrentCompany(result.company.id, result.company.name);
      queryClient.clear();
      setOpen(false);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setCreateError(axiosError?.response?.data?.message || 'Erro ao criar empresa');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
            'hover:bg-sidebar-accent',
            'text-sidebar-foreground',
            isCollapsed && 'justify-center'
          )}
        >
          <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium truncate flex-1 text-left">
                {currentCompanyName || 'Selecionar empresa'}
              </span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={8} className="w-72 p-0">
        <div className="p-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">
            Suas empresas
          </p>
        </div>

        <div className="max-h-60 overflow-y-auto p-1">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : companies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma empresa encontrada
            </p>
          ) : (
            companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSwitch(company)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer',
                  'hover:bg-accent',
                  company.id === currentCompanyId &&
                    'bg-primary/10'
                )}
              >
                <span className="flex-1 text-left truncate text-foreground">
                  {company.name}
                </span>
                <Badge
                  variant={company.role === 'OWNER' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {company.role}
                </Badge>
                {company.id === currentCompanyId && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-border p-2">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar nova empresa</span>
            </button>
          ) : (
            <div className="space-y-2">
              <Input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Nome da empresa"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCompanyName.trim()) {
                    handleCreate();
                  }
                }}
              />
              {createError && (
                <p className="text-xs text-destructive">{createError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCompanyName('');
                    setCreateError(null);
                  }}
                  className="flex-1 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={creating || !newCompanyName.trim()}
                  className="flex-1 cursor-pointer"
                >
                  {creating ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
