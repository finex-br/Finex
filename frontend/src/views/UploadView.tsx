import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { pendingDocumentsService } from '@/services/pendingDocumentsService';
import { AppLayout } from '@/components/AppLayout';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * UploadView - Componente Presentacional (Dumb Component)
 * 
 * Responsabilidades:
 * - Renderizar interface de upload
 * - Capturar arquivo do usuário
 * - Exibir feedback visual
 * 
 * TODA lógica está no useFinancialData (ViewModel).
 * Backend processa o Excel (processamento removido do frontend).
 */
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

    // Validar tipo de arquivo
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
      console.log('[UploadView] Enviando documento para revisão...', {
        fileName: selectedFile.name,
      });

      const result = await pendingDocumentsService.upload(selectedFile);

      if (!result.success) {
        setUploadError(result.message || 'Falha ao enviar documento');
        return;
      }

      setUploadSuccess(true);

      // ADMIN do sistema pode revisar imediatamente; usuários comuns voltam ao dashboard
      setTimeout(() => {
        navigate(isSystemAdmin ? `/admin/pending-documents/${result.documentId}` : `/documents/${result.documentId}`);
      }, 1200);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        'Erro ao enviar documento. Verifique sua conexão e tente novamente.';

      setUploadError(message);

      // UX: if user has no company yet, send them to the setup page
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

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        {/* Conteúdo principal */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Upload de Planilha Financeira
              </CardTitle>
              <CardDescription className="text-base">
              Envie seu arquivo Excel para revisão (mapeamento e validação)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Área de Upload */}
            <div
              onClick={handleClickUpload}
              className="p-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
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
                <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-slate-700 text-lg mb-2">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar um arquivo'}
                </p>
                <p className="text-sm text-slate-500">
                  Formatos aceitos: .xlsx, .xls
                </p>
              </div>
            </div>

            {/* Mensagem de Sucesso */}
            {uploadSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {isSystemAdmin
                    ? 'Documento enviado com sucesso! Redirecionando para a revisão...'
                    : 'Documento enviado com sucesso! Um administrador irá revisar.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Mensagem de Erro */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {/* Botão de Upload */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || uploadSuccess}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
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

            {/* Informações */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>ℹ️ Formato esperado:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 ml-4 space-y-1 list-disc">
                <li>Colunas: Data, Descrição, Categoria, Valor, Tipo</li>
                <li>Tipo: "Receita" ou "Despesa"</li>
                <li>Valores numéricos (use ponto ou vírgula)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </AppLayout>
  );
}
