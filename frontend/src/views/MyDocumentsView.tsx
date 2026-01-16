import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMyPendingDocumentsViewModel } from '@/hooks/useMyPendingDocumentsViewModel';

export function MyDocumentsView() {
  const { isLoading, error, documents, total, fetchMyDocuments } = useMyPendingDocumentsViewModel();

  useEffect(() => {
    fetchMyDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Meus documentos</CardTitle>
              <Button onClick={() => fetchMyDocuments()} disabled={isLoading}>
                Atualizar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-slate-600 dark:text-slate-300">Total: {total}</div>

              <div className="rounded-md border bg-white dark:bg-slate-950">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Linhas</TableHead>
                      <TableHead>Última atualização</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.fileName}</TableCell>
                        <TableCell>{doc.status}</TableCell>
                        <TableCell>{doc.totalRows}</TableCell>
                        <TableCell>{new Date(doc.updatedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/documents/${doc.id}`}>Acompanhar</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!isLoading && documents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          Você ainda não enviou documentos.
                        </TableCell>
                      </TableRow>
                    )}

                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
