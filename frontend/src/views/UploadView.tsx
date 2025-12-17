import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, LogOut, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearAuth, currentCompanyId } = useAuthStore();
  const { uploadExcel, isUploading, uploadError, uploadSuccess } = useFinancialData();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

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

    // TEMPORÁRIO: Usa 'default-company' até implementar sistema de múltiplas empresas
    const companyId = currentCompanyId || 'default-company';
    
    // Chama o ViewModel (que chama o service, que chama o backend)
    const success = await uploadExcel(selectedFile, companyId);
    
    if (success) {
      // Redirecionar para o dashboard após 1.5 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header com botão de logout */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl font-bold text-slate-900">Importar Planilha</h1>
          </div>
          
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Upload de Planilha Financeira
            </CardTitle>
            <CardDescription className="text-base">
              Envie seu arquivo Excel para visualizar os dados no dashboard
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
                  Arquivo processado com sucesso! Redirecionando para o dashboard...
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
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Processar Planilha
                </>
              )}
            </Button>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Formato esperado:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1 list-disc">
                <li>Colunas: Data, Descrição, Categoria, Valor, Tipo</li>
                <li>Tipo: "Receita" ou "Despesa"</li>
                <li>Valores numéricos (use ponto ou vírgula)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
