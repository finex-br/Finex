import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { DashboardChartList } from '@/components/admin/DashboardChartList';
import { SafeHtmlRenderer } from '@/components/dashboard/SafeHtmlRenderer';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import {
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit,
  Settings,
  Code,
} from 'lucide-react';

export function DashboardConfigView() {
  const { id: dashboardId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const companyId = searchParams.get('companyId') || '';

  const {
    selectedDashboard,
    charts,
    isLoading,
    error,
    fetchDashboardWithCharts,
    updateDashboard,
    deleteChart,
    clearError,
  } = useDashboardConfig();

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEmbedHtml, setEditEmbedHtml] = useState('');
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  // Delete chart confirmation state
  const [deleteChartId, setDeleteChartId] = useState<string | null>(null);

  // Load dashboard with charts on mount
  useEffect(() => {
    if (dashboardId && companyId) {
      fetchDashboardWithCharts(dashboardId, companyId);
    }
  }, [dashboardId, companyId, fetchDashboardWithCharts]);

  // Sync edit form with selected dashboard
  useEffect(() => {
    if (selectedDashboard) {
      setEditName(selectedDashboard.name);
      setEditDescription(selectedDashboard.description || '');
      setEditEmbedHtml(selectedDashboard.embedHtml || '');
    }
  }, [selectedDashboard]);

  const handleEditSave = useCallback(async () => {
    if (!dashboardId || !companyId || !editName.trim()) return;

    const result = await updateDashboard(dashboardId, companyId, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      embedHtml: editEmbedHtml.trim() || '',
    });

    if (result) {
      toast({
        title: 'Dashboard atualizado',
        description: 'As informacoes do dashboard foram salvas.',
      });
      setEditDialogOpen(false);
      setShowEmbedPreview(false);
    }
  }, [dashboardId, companyId, editName, editDescription, editEmbedHtml, updateDashboard, toast]);

  const handleAddChart = useCallback(() => {
    if (!dashboardId || !companyId) return;
    navigate(
      `/admin/chart-builder?dashboardId=${dashboardId}&companyId=${companyId}`,
    );
  }, [dashboardId, companyId, navigate]);

  const handleEditChart = useCallback(
    (chartId: string) => {
      if (!dashboardId || !companyId) return;
      navigate(
        `/admin/chart-builder/${chartId}?dashboardId=${dashboardId}&companyId=${companyId}`,
      );
    },
    [dashboardId, companyId, navigate],
  );

  const handleDeleteChartConfirm = useCallback(async () => {
    if (!deleteChartId || !companyId) return;
    const success = await deleteChart(deleteChartId, companyId);
    if (success) {
      toast({
        title: 'Grafico excluido',
        description: 'O grafico foi removido do dashboard.',
      });
    }
    setDeleteChartId(null);
  }, [deleteChartId, companyId, deleteChart, toast]);

  const handleViewDashboard = useCallback(() => {
    if (!dashboardId || !companyId) return;
    navigate(`/dynamic-dashboard/${dashboardId}?companyId=${companyId}`);
  }, [dashboardId, companyId, navigate]);

  const handleBack = useCallback(() => {
    navigate(`/admin/dashboards?companyId=${companyId}`);
  }, [navigate, companyId]);

  // Map charts for DashboardChartList
  const chartItems = charts.map((c) => ({
    id: c.id,
    name: c.name,
    chartType: c.chartType,
    displayOrder: c.displayOrder,
  }));

  if (isLoading && !selectedDashboard) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    <Settings className="h-7 w-7 inline-block mr-2 -mt-1" />
                    Configurar Dashboard
                  </h1>
                </div>
                {selectedDashboard && (
                  <div className="mt-2">
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                      {selectedDashboard.name}
                    </p>
                    {selectedDashboard.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {selectedDashboard.description}
                      </p>
                    )}
                    {selectedDashboard.embedHtml && (
                      <Badge variant="secondary" className="mt-2">
                        <Code className="h-3 w-3 mr-1" />
                        Embed HTML configurado
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Info
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewDashboard}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Dashboard
              </Button>
            </div>
          </div>

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

          {/* Charts List */}
          <Card>
            <CardContent className="pt-6">
              <DashboardChartList
                charts={chartItems}
                onEdit={handleEditChart}
                onDelete={(chartId) => setDeleteChartId(chartId)}
                onAddChart={handleAddChart}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dashboard Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Dashboard</DialogTitle>
            <DialogDescription>
              Atualize as informacoes do dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                placeholder="Nome do dashboard"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descricao (opcional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Descricao do dashboard..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-embed-html">
                Embed HTML
              </Label>
              <p className="text-xs text-muted-foreground">
                Cole o código HTML completo para exibir no dashboard.
              </p>
              <Textarea
                id="edit-embed-html"
                placeholder='<html><body><h1>Meu Dashboard</h1></body></html>'
                value={editEmbedHtml}
                onChange={(e) => setEditEmbedHtml(e.target.value)}
                rows={5}
                className="font-mono text-xs"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmbedPreview((prev) => !prev)}
                  disabled={!editEmbedHtml.trim()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showEmbedPreview ? 'Ocultar Preview' : 'Preview'}
                </Button>
                {editEmbedHtml.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditEmbedHtml('')}
                  >
                    Limpar
                  </Button>
                )}
              </div>
              {showEmbedPreview && editEmbedHtml.trim() && (
                <div className="mt-2 rounded-md border p-4 bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                  <SafeHtmlRenderer
                    html={editEmbedHtml}
                    className="w-full [&_iframe]:w-full [&_iframe]:min-h-[300px] [&_iframe]:rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={isLoading || !editName.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Chart Confirmation Dialog */}
      <AlertDialog
        open={!!deleteChartId}
        onOpenChange={(open) => !open && setDeleteChartId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Grafico</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este grafico? Esta acao nao pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChartConfirm}
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
