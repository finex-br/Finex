import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMyPendingDocumentDetailViewModel } from '@/hooks/useMyPendingDocumentDetailViewModel';

export function MyDocumentDetailView() {
  const { id } = useParams();
  const documentId = id || '';

  const { isLoading, error, document, headers, previewRows, validation } =
    useMyPendingDocumentDetailViewModel(documentId);

  const audit = useMemo(() => {
    const entries = document?.columnMapping?.audit || [];
    return [...entries].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [document]);

  const excludedRows = useMemo(() => document?.columnMapping?.excludedRows || [], [document]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading && <div className="text-sm text-slate-500">Carregando...</div>}

              {document && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Arquivo:</span> {document.fileName}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {document.status}
                  </div>
                  <div>
                    <span className="font-medium">Total de linhas:</span> {document.rawData.totalRows}
                  </div>
                  <div>
                    <span className="font-medium">Atualizado em:</span> {new Date(document.updatedAt).toLocaleString()}
                  </div>
                </div>
              )}

              {document?.notes && (
                <Alert>
                  <AlertDescription>
                    <span className="font-medium">Comentário do administrador:</span> {document.notes}
                  </AlertDescription>
                </Alert>
              )}

              {excludedRows.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Linhas excluídas pelo admin (ignoradas na validação/importação): {excludedRows.join(', ')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-white dark:bg-slate-950 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, idx) => (
                      <TableRow key={idx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx}>
                            {cell === null || cell === undefined ? '' : String(cell)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                    {!isLoading && document && previewRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={headers.length || 1} className="text-center text-slate-500">
                          Sem linhas de preview.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status e validação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!document?.columnMapping && (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Aguardando o administrador mapear as colunas.
                </div>
              )}

              {document?.columnMapping && !validation && (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Mapeamento definido. Aguardando validação/revisão do administrador.
                </div>
              )}

              {validation && (
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Linhas válidas:</span> {validation.validTransactions}
                  </div>
                  <div>
                    <span className="font-medium">Linhas inválidas:</span> {validation.invalidTransactions}
                  </div>
                  <div>
                    <span className="font-medium">Pode importar (tem linhas válidas):</span>{' '}
                    {validation.isValid ? 'Sim' : 'Não'}
                  </div>
                </div>
              )}

              {validation && validation.errors.length > 0 && (
                <div className="rounded-md border bg-white dark:bg-slate-950 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Linha</TableHead>
                        <TableHead>Campo</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Conteúdo da linha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.errors.slice(0, 50).map((e, idx) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={idx}>
                          <TableCell>{e.row}</TableCell>
                          <TableCell>{e.field}</TableCell>
                          <TableCell>{e.message}</TableCell>
                          <TableCell>
                            {e.rowData ? (
                              <pre className="text-xs whitespace-pre-wrap max-w-[700px]">
                                {JSON.stringify(e.rowData, null, 2)}
                              </pre>
                            ) : (
                              <span className="text-xs text-slate-500">(sem snapshot)</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alterações do administrador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {audit.length === 0 && (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Nenhuma alteração registrada ainda.
                </div>
              )}

              {audit.length > 0 && (
                <div className="rounded-md border bg-white dark:bg-slate-950 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quando</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audit.map((a, idx) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={idx}>
                          <TableCell>{new Date(a.at).toLocaleString()}</TableCell>
                          <TableCell>{a.action}</TableCell>
                          <TableCell>
                            <pre className="text-xs whitespace-pre-wrap max-w-[700px]">
                              {JSON.stringify(a.details ?? {}, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
