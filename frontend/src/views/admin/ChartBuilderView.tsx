import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { CompanySelector } from '@/components/admin/CompanySelector';
import { ChartTypeSelector } from '@/components/admin/ChartTypeSelector';
import { ColumnMapper } from '@/components/admin/ColumnMapper';
import { ChartPreview } from '@/components/admin/ChartPreview';
import { useChartBuilder } from '@/hooks/useChartBuilder';
import { useDatasetManagement } from '@/hooks/useDatasetManagement';
import { useToast } from '@/hooks/use-toast';
import { companyService, CompanySummary } from '@/services/companyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  AlertCircle,
  Save,
  Eye,
  ArrowLeft,
} from 'lucide-react';

export function ChartBuilderView() {
  const { chartId } = useParams<{ chartId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const dashboardId = searchParams.get('dashboardId') || '';
  const initialCompanyId = searchParams.get('companyId') || '';

  const isEditing = !!chartId;

  const {
    name,
    chartType,
    datasetId,
    dataSource,
    visualConfig,
    availableColumns,
    previewData,
    isLoading: chartLoading,
    error: chartError,
    setName,
    setChartType,
    setDatasetId,
    setVisualConfig,
    setQuery,
    loadDatasetColumns,
    fetchPreview,
    saveChart,
    loadChartForEditing,
    resetBuilder,
    clearError: clearChartError,
  } = useChartBuilder();

  const {
    datasets,
    isLoading: datasetsLoading,
    fetchDatasets,
  } = useDatasetManagement();

  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [xAxis, setXAxis] = useState<string | undefined>(visualConfig.xAxis);
  const [yAxis, setYAxis] = useState<string[] | undefined>(visualConfig.yAxis);
  const [colorBy, setColorBy] = useState<string | undefined>(visualConfig.colorBy);

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

  // Load datasets when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      fetchDatasets(selectedCompanyId);
    }
  }, [selectedCompanyId, fetchDatasets]);

  // Load chart for editing
  useEffect(() => {
    if (chartId && selectedCompanyId) {
      loadChartForEditing(chartId, selectedCompanyId);
    }
  }, [chartId, selectedCompanyId, loadChartForEditing]);

  // Sync visual config into local state when chart is loaded for editing
  useEffect(() => {
    if (isEditing && visualConfig) {
      setXAxis(visualConfig.xAxis);
      setYAxis(visualConfig.yAxis);
      setColorBy(visualConfig.colorBy);
    }
  }, [isEditing, visualConfig]);

  // Load columns when dataset changes
  useEffect(() => {
    if (datasetId && selectedCompanyId) {
      loadDatasetColumns(datasetId, selectedCompanyId);
    }
  }, [datasetId, selectedCompanyId, loadDatasetColumns]);

  // Build query from column mapper selections
  const buildQuery = useCallback(() => {
    if (!xAxis && (!yAxis || yAxis.length === 0)) return;

    const selectItems: { column: string; aggregate?: 'SUM'; alias?: string }[] = [];
    const groupByColumns: string[] = [];

    const needsGroupBy = !!xAxis && yAxis && yAxis.length > 0;

    if (xAxis) {
      selectItems.push({ column: xAxis });
      if (needsGroupBy) {
        groupByColumns.push(xAxis);
      }
    }

    if (yAxis) {
      for (const col of yAxis) {
        if (needsGroupBy) {
          selectItems.push({ column: col, aggregate: 'SUM', alias: col });
        } else {
          selectItems.push({ column: col });
        }
      }
    }

    setQuery({
      select: selectItems,
      groupBy: groupByColumns.length > 0 ? groupByColumns : undefined,
      limit: 100,
    });
  }, [xAxis, yAxis, setQuery]);

  // Update visual config and rebuild query when axes change
  useEffect(() => {
    setVisualConfig({ xAxis, yAxis, colorBy });
    buildQuery();
  }, [xAxis, yAxis, colorBy, setVisualConfig, buildQuery]);

  const handleXAxisChange = useCallback((col: string) => {
    setXAxis(col);
  }, []);

  const handleYAxisChange = useCallback((cols: string[]) => {
    setYAxis(cols);
  }, []);

  const handleColorByChange = useCallback((col: string | undefined) => {
    setColorBy(col);
  }, []);

  const handleDatasetChange = useCallback(
    (newDatasetId: string) => {
      setDatasetId(newDatasetId);
      setXAxis(undefined);
      setYAxis(undefined);
      setColorBy(undefined);
    },
    [setDatasetId],
  );

  const handlePreview = useCallback(() => {
    if (!selectedCompanyId) return;
    fetchPreview(selectedCompanyId);
  }, [selectedCompanyId, fetchPreview]);

  const handleSave = useCallback(async () => {
    if (!dashboardId || !selectedCompanyId) {
      toast({
        title: 'Erro',
        description: 'Dashboard e empresa sao obrigatorios',
        variant: 'destructive',
      });
      return;
    }

    const result = await saveChart(dashboardId, selectedCompanyId);
    if (result) {
      toast({
        title: isEditing ? 'Grafico atualizado' : 'Grafico criado',
        description: `O grafico "${name}" foi salvo com sucesso.`,
      });
      navigate(
        `/admin/dashboards/${dashboardId}/config?companyId=${selectedCompanyId}`,
      );
    }
  }, [
    dashboardId,
    selectedCompanyId,
    saveChart,
    toast,
    isEditing,
    name,
    navigate,
  ]);

  const handleBack = useCallback(() => {
    if (dashboardId && selectedCompanyId) {
      navigate(
        `/admin/dashboards/${dashboardId}/config?companyId=${selectedCompanyId}`,
      );
    } else {
      navigate(-1);
    }
  }, [dashboardId, selectedCompanyId, navigate]);

  // Normalize columns for ColumnMapper (lowercase type)
  const normalizedColumns = useMemo(
    () =>
      availableColumns.map((c) => ({
        name: c.name,
        type: c.type.toLowerCase(),
      })),
    [availableColumns],
  );

  const previewChartData = useMemo(() => {
    if (!previewData) return null;
    return {
      columns: previewData.columns,
      rows: previewData.rows,
      totalRows: previewData.totalRows,
    };
  }, [previewData]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Editar Grafico' : 'Criar Grafico'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Configure os dados e a visualizacao do grafico
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {chartError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{chartError}</span>
                <Button variant="ghost" size="sm" onClick={clearChartError}>
                  Fechar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Company Selector */}
          <Card>
            <CardContent className="pt-6">
              <CompanySelector
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelect={setSelectedCompanyId}
                isLoading={companiesLoading}
              />
            </CardContent>
          </Card>

          {selectedCompanyId && (
            <>
              {/* Step 1: Chart Name */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Nome do Grafico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="chart-name">Nome</Label>
                    <Input
                      id="chart-name"
                      placeholder="Ex: Vendas por Mes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Dataset Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>2. Selecionar Dataset</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Dataset</Label>
                    <Select
                      value={datasetId}
                      onValueChange={handleDatasetChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasetsLoading ? (
                          <SelectItem value="__loading__" disabled>
                            Carregando...
                          </SelectItem>
                        ) : datasets.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            Nenhum dataset disponivel
                          </SelectItem>
                        ) : (
                          datasets.map((ds) => (
                            <SelectItem key={ds.id} value={ds.id}>
                              {ds.name} ({ds.rowCount} linhas)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Chart Type */}
              <Card>
                <CardHeader>
                  <CardTitle>3. Tipo de Grafico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartTypeSelector
                    selectedType={chartType}
                    onSelect={(type) => setChartType(type as any)}
                  />
                </CardContent>
              </Card>

              {/* Step 4: Column Mapper */}
              {availableColumns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>4. Mapeamento de Colunas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ColumnMapper
                      columns={normalizedColumns}
                      xAxis={xAxis}
                      yAxis={yAxis}
                      colorBy={colorBy}
                      onXAxisChange={handleXAxisChange}
                      onYAxisChange={handleYAxisChange}
                      onColorByChange={handleColorByChange}
                      chartType={chartType}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>5. Preview</CardTitle>
                    <Button
                      onClick={handlePreview}
                      disabled={
                        chartLoading ||
                        !datasetId ||
                        (!xAxis && (!yAxis || yAxis.length === 0))
                      }
                      size="sm"
                    >
                      {chartLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Gerar Preview
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartPreview
                    chartType={chartType}
                    data={previewChartData}
                    visualConfig={visualConfig}
                    isLoading={chartLoading}
                  />
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleBack}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={chartLoading || !name.trim() || !datasetId || !dashboardId}
                >
                  {chartLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Salvar Alteracoes' : 'Salvar Grafico'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
