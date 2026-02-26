import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, Download } from 'lucide-react';
import { pendingDocumentsService } from '@/services/pendingDocumentsService';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';
import * as XLSX from 'xlsx';

const MODEL_COLUMNS = [
  'id_lancamento',
  'tipo_movimento',
  'categoria_movimento',
  'descricao',
  'data_competencia',
  'data_vencimento',
  'data_pagamento_recebimento',
  'periodo_referencia',
  'valor_bruto',
  'juros_multas',
  'descontos',
  'valor_liquido',
  'valor_pago_recebido',
  'conta_bancaria',
  'tipo_conta',
  'forma_pagamento',
  'status_pagamento',
  'plano_contas_dre',
  'subconta_dre',
  'centro_custo',
  'nucleo_negocio',
  'numero_parcela',
  'total_parcelas',
  'recorrente',
  'contraparte_nome',
  'observacoes',
];

const REQUIRED_COLUMNS = [
  'id_lancamento',
  'tipo_movimento',
  'data_competencia',
  'valor_bruto',
  'valor_liquido',
  'status_pagamento',
  'plano_contas_dre',
];

const OPTIONAL_COLUMNS = MODEL_COLUMNS.filter((c) => !REQUIRED_COLUMNS.includes(c));

export function UploadView() {
  const navigate = useNavigate();
  const isSystemAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await pendingDocumentsService.upload(selectedFile);

      if (!result.success) {
        setUploadError(result.message || 'Falha ao enviar documento');
        return;
      }

      setUploadSuccess(true);

      setTimeout(() => {
        navigate(isSystemAdmin ? `/admin/pending-documents/${result.documentId}` : `/documents/${result.documentId}`);
      }, 1200);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        'Erro ao enviar documento. Verifique sua conexão e tente novamente.';

      setUploadError(message);

      if (message.toLowerCase().includes('not associated with any company')) {
        setTimeout(() => navigate('/company/setup'), 600);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadModel = () => {
    const ws = XLSX.utils.aoa_to_sheet([MODEL_COLUMNS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, 'modelo-importacao-finex.xlsx');
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Importar Dados"
            subtitle="Envie seu arquivo Excel para revisão"
          />

          <div className="glass-card p-6 space-y-6 max-w-2xl mx-auto">
            {/* Upload Area */}
            <div
              onClick={handleClickUpload}
              className="p-8 border-2 border-dashed border-border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              <div className="text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-foreground text-lg mb-2">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar um arquivo'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Formatos aceitos: .xlsx, .xls
                </p>
              </div>
            </div>

            {/* Success */}
            {uploadSuccess && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  {isSystemAdmin
                    ? 'Documento enviado com sucesso! Redirecionando para a revisão...'
                    : 'Documento enviado com sucesso! Um administrador irá revisar.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Error */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || uploadSuccess}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Enviar para revisão
                </>
              )}
            </Button>

            {/* Download Model Button */}
            <Button variant="outline" onClick={handleDownloadModel} className="w-full">
              <Download className="mr-2 h-5 w-5" />
              Baixar planilha modelo
            </Button>

            {/* Info */}
            <div className="glass-card p-4 space-y-3">
              <p className="text-sm text-foreground font-medium">
                Formato esperado:
              </p>
              <div>
                <p className="text-xs text-foreground font-medium mb-1">Campos obrigatórios:</p>
                <p className="text-xs text-muted-foreground">
                  {MODEL_COLUMNS.join(', ')}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Valores numéricos (use ponto ou vírgula). Datas no formato YYYY-MM-DD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
