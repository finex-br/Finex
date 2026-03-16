import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { CompanySelector } from '@/components/admin/CompanySelector';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { useToast } from '@/hooks/use-toast';
import { companyService, CompanySummary } from '@/services/companyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  LayoutDashboard,
  Plus,
  Settings,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Star,
} from 'lucide-react';

export function DashboardListView() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    dashboards,
    isLoading,
    error,
    fetchDashboards,
    createDashboard,
    deleteDashboard,
    clearError,
  } = useDashboardConfig();

  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(true);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDescription, setNewDashboardDescription] = useState('');
  const [newDashboardIsDefault, setNewDashboardIsDefault] = useState(false);

  // Delete confirmation state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      setCompaniesLoading(true);
      try {
        const result = await companyService.listMyCompanies();
        setCompanies(result.companies);
      } catch {
        toast({
          title: 'Erro',
          description: 'Falha ao carregar empresas',
          variant: 'destructive',
        });
      } finally {
        setCompaniesLoading(false);
      }
    };
    loadCompanies();
  }, [toast]);

  // Fetch dashboards when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      fetchDashboards(selectedCompanyId);
    }
  }, [selectedCompanyId, fetchDashboards]);

  const handleCreate = useCallback(async () => {
    if (!newDashboardName.trim() || !selectedCompanyId) return;

    const result = await createDashboard(
      selectedCompanyId,
      newDashboardName.trim(),
      newDashboardDescription.trim() || undefined,
      newDashboardIsDefault,
    );

    if (result) {
      toast({
        title: 'Dashboard criado',
        description: `O dashboard "${result.name}" foi criado com sucesso.`,
      });
      setCreateDialogOpen(false);
      setNewDashboardName('');
      setNewDashboardDescription('');
      setNewDashboardIsDefault(false);
    }
  }, [
    newDashboardName,
    newDashboardDescription,
    newDashboardIsDefault,
    selectedCompanyId,
    createDashboard,
    toast,
  ]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargetId || !selectedCompanyId) return;
    const success = await deleteDashboard(deleteTargetId, selectedCompanyId);
    if (success) {
      toast({
        title: 'Dashboard excluido',
        description: 'O dashboard foi removido com sucesso.',
      });
    }
    setDeleteTargetId(null);
  }, [deleteTargetId, selectedCompanyId, deleteDashboard, toast]);

  const handleConfigure = useCallback(
    (dashboardId: string) => {
      navigate(
        `/admin/dashboards/${dashboardId}/config?companyId=${selectedCompanyId}`,
      );
    },
    [navigate, selectedCompanyId],
  );

  const handleView = useCallback(
    (dashboardId: string) => {
      navigate(
        `/dynamic-dashboard/${dashboardId}?companyId=${selectedCompanyId}`,
      );
    },
    [navigate, selectedCompanyId],
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboards
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie os dashboards da empresa
              </p>
            </div>
            {selectedCompanyId && (
              <Button onClick={() => setCreateDialogOpen(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Novo Dashboard
              </Button>
            )}
          </div>

          {/* Company Selector */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <CompanySelector
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelect={setSelectedCompanyId}
                isLoading={companiesLoading}
              />
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Fechar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Dashboards List */}
          {selectedCompanyId && (
            <div>
              {isLoading && dashboards.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : dashboards.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <LayoutDashboard className="h-12 w-12 mb-3" />
                    <p className="text-sm">Nenhum dashboard encontrado</p>
                    <p className="text-xs mt-1">
                      Crie um novo dashboard para comecar
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboards.map((dashboard) => (
                    <Card key={dashboard.id} className="glass-card-hover border cursor-pointer">
                      <CardContent className="p-5 space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {dashboard.name}
                            </h4>
                            {dashboard.isDefault && (
                              <Badge variant="default" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Padrao
                              </Badge>
                            )}
                          </div>
                          {dashboard.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {dashboard.description}
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Criado em{' '}
                          {new Date(dashboard.createdAt).toLocaleDateString(
                            'pt-BR',
                          )}
                        </p>

                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConfigure(dashboard.id)}
                            className="flex-1 cursor-pointer"
                          >
                            <Settings className="h-3.5 w-3.5 mr-1.5" />
                            Configurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(dashboard.id)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTargetId(dashboard.id)}
                            className="text-destructive hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Dashboard Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Dashboard</DialogTitle>
            <DialogDescription>
              Preencha as informacoes para criar um novo dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Nome</Label>
              <Input
                id="dashboard-name"
                placeholder="Nome do dashboard"
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Descricao (opcional)</Label>
              <Textarea
                id="dashboard-description"
                placeholder="Descricao do dashboard..."
                value={newDashboardDescription}
                onChange={(e) => setNewDashboardDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="dashboard-default"
                checked={newDashboardIsDefault}
                onCheckedChange={(checked) =>
                  setNewDashboardIsDefault(checked === true)
                }
              />
              <Label htmlFor="dashboard-default" className="font-normal cursor-pointer">
                Definir como dashboard padrao
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !newDashboardName.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Dashboard</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este dashboard? Todos os graficos
              associados tambem serao removidos. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
