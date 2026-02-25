import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { CompanySelector } from '@/components/admin/CompanySelector';
import { DatasetUploader } from '@/components/admin/DatasetUploader';
import { DatasetPreview } from '@/components/admin/DatasetPreview';
import { useDatasetManagement } from '@/hooks/useDatasetManagement';
import { useToast } from '@/hooks/use-toast';
import { companyService, CompanySummary } from '@/services/companyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Database,
  FileSpreadsheet,
  Eye,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export function DatasetManagementView() {
  const { toast } = useToast();

  const {
    datasets,
    selectedDataset,
    uploadResult,
    isLoading,
    error,
    fetchDatasets,
    uploadDataset,
    fetchPreview,
    downloadDataset,
    deleteDataset,
    clearError,
    clearUploadResult,
    setSelectedDataset,
  } = useDatasetManagement();

  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const selectedCompanyName = companies.find(
    (c) => c.id === selectedCompanyId,
  )?.name;

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

  // Fetch datasets when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      fetchDatasets(selectedCompanyId);
      setSelectedDataset(null);
    }
  }, [selectedCompanyId, fetchDatasets, setSelectedDataset]);

  // Show toast after successful upload
  useEffect(() => {
    if (uploadResult) {
      toast({
        title: 'Upload realizado',
        description: `Dataset "${uploadResult.name}" enviado com sucesso. ${uploadResult.rowCount} linhas processadas.`,
      });
      fetchDatasets(selectedCompanyId);
      clearUploadResult();
    }
  }, [uploadResult, toast, fetchDatasets, selectedCompanyId, clearUploadResult]);

  const handleUpload = useCallback(
    (file: File, name: string) => {
      if (!selectedCompanyId) return;
      uploadDataset(file, name, selectedCompanyId);
    },
    [selectedCompanyId, uploadDataset],
  );

  const handlePreview = useCallback(
    (datasetId: string) => {
      if (!selectedCompanyId) return;
      fetchPreview(datasetId, selectedCompanyId);
    },
    [selectedCompanyId, fetchPreview],
  );

  const handleDownload = useCallback(
    (datasetId: string, fileName: string) => {
      if (!selectedCompanyId) return;
      downloadDataset(datasetId, selectedCompanyId, fileName);
    },
    [selectedCompanyId, downloadDataset],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTargetId || !selectedCompanyId) return;
    const success = await deleteDataset(deleteTargetId, selectedCompanyId);
    if (success) {
      toast({
        title: 'Dataset excluido',
        description: 'O dataset foi removido com sucesso.',
      });
    }
    setDeleteTargetId(null);
  }, [deleteTargetId, selectedCompanyId, deleteDataset, toast]);

  const handleClosePreview = useCallback(() => {
    setSelectedDataset(null);
  }, [setSelectedDataset]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Gerenciamento de Datasets
            </h1>
            {selectedCompanyName && (
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Empresa: {selectedCompanyName}
              </p>
            )}
          </div>

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

          {selectedCompanyId && (
            <>
              {/* Dataset Uploader */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Enviar Novo Dataset
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DatasetUploader
                    onUpload={handleUpload}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>

              {/* Dataset Preview (shown when a dataset is selected) */}
              {selectedDataset && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Preview do Dataset
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClosePreview}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DatasetPreview
                      columns={selectedDataset.columns}
                      rows={selectedDataset.rows}
                      totalRows={selectedDataset.totalRows}
                      datasetName={selectedDataset.name}
                      onDownload={() =>
                        handleDownload(
                          selectedDataset.id,
                          `${selectedDataset.name}.csv`,
                        )
                      }
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Datasets List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Datasets ({datasets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading && datasets.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : datasets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Database className="h-12 w-12 mb-3" />
                      <p className="text-sm">Nenhum dataset encontrado</p>
                      <p className="text-xs mt-1">
                        Envie um arquivo para comecar
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {datasets.map((dataset) => (
                        <Card key={dataset.id} className="border">
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h4 className="font-medium text-sm truncate">
                                {dataset.name}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {dataset.fileName}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="secondary" className="text-xs">
                                {dataset.rowCount.toLocaleString('pt-BR')} linhas
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {dataset.columns.length} colunas
                              </Badge>
                              <Badge
                                variant={
                                  dataset.status === 'READY'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {dataset.status}
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {new Date(dataset.createdAt).toLocaleDateString(
                                'pt-BR',
                              )}
                            </p>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreview(dataset.id)}
                                className="flex-1"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownload(dataset.id, dataset.fileName)
                                }
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteTargetId(dataset.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Dataset</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este dataset? Esta acao nao pode ser
              desfeita.
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
