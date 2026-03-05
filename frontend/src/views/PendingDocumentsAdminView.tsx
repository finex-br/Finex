import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePendingDocumentsViewModel } from '@/hooks/usePendingDocumentsViewModel';
import { RefreshCw } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  UPLOADED: 'Enviado',
  MAPPED: 'Mapeado',
  VALIDATED: 'Validado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
};

export function PendingDocumentsAdminView() {
  const { isLoading, error, documents, total, companyNames, fetchPendingDocuments } =
    usePendingDocumentsViewModel();

  useEffect(() => {
    fetchPendingDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            breadcrumb="Administração"
            title="Documentos Pendentes"
            subtitle="Revise e aprove os documentos enviados"
            actions={
              <Button onClick={() => fetchPendingDocuments()} disabled={isLoading} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            }
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              {!isLoading && <span className="text-sm text-muted-foreground">Total: {total}</span>}
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Empresa</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Linhas</TableHead>
                    <TableHead>Mapping</TableHead>
                    <TableHead>Validação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className="border-border">
                      <TableCell className="text-muted-foreground truncate max-w-[120px]">{companyNames[doc.companyId] || doc.companyId || '—'}</TableCell>
                      <TableCell className="font-medium text-foreground">{doc.fileName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {STATUS_LABELS[doc.status] || doc.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{doc.totalRows}</TableCell>
                      <TableCell>
                        <span className={doc.hasMapping ? 'text-green-500' : 'text-muted-foreground'}>
                          {doc.hasMapping ? 'Sim' : 'Não'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={doc.hasValidation ? 'text-green-500' : 'text-muted-foreground'}>
                          {doc.hasValidation ? 'Sim' : 'Não'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/admin/pending-documents/${doc.id}`}>Abrir</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!isLoading && documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum documento pendente.
                      </TableCell>
                    </TableRow>
                  )}

                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
