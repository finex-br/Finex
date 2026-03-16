import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMyPendingDocumentsViewModel } from '@/hooks/useMyPendingDocumentsViewModel';
import { RefreshCw } from 'lucide-react';

export function MyDocumentsView() {
  const { isLoading, error, documents, total, fetchMyDocuments } = useMyPendingDocumentsViewModel();

  useEffect(() => {
    fetchMyDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Meus Documentos"
            actions={
              <Button onClick={() => fetchMyDocuments()} disabled={isLoading} variant="outline">
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

          <div className="surface-elevated overflow-hidden">
            <div className="p-4 border-b border-border">
              {!isLoading && <span className="text-sm text-muted-foreground">Total: {total}</span>}
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Linhas</TableHead>
                    <TableHead>Última atualização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{doc.fileName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {doc.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{doc.totalRows}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(doc.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm" className="cursor-pointer">
                          <Link to={`/documents/${doc.id}`}>Acompanhar</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!isLoading && documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Você ainda não enviou documentos.
                      </TableCell>
                    </TableRow>
                  )}

                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
