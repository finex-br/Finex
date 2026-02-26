import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            breadcrumb="Meus Documentos"
            title="Documento"
          />

          {/* Document Info */}
          <div className="glass-card p-6 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}

            {document && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-foreground">Arquivo:</span>{' '}
                  <span className="text-muted-foreground">{document.fileName}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Status:</span>{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {document.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Total de linhas:</span>{' '}
                  <span className="text-muted-foreground">{document.rawData.totalRows}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Atualizado em:</span>{' '}
                  <span className="text-muted-foreground">{new Date(document.updatedAt).toLocaleString()}</span>
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
              <div className="text-xs text-muted-foreground">
                Linhas excluídas pelo admin (ignoradas na validação/importação): {excludedRows.join(', ')}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Preview</h2>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    {headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, idx) => (
                    <TableRow key={idx} className="border-border">
                      {row.map((cell, cellIdx) => (
                        <TableCell key={cellIdx}>
                          {cell === null || cell === undefined ? '' : String(cell)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {!isLoading && document && previewRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={headers.length || 1} className="text-center text-muted-foreground py-8">
                        Sem linhas de preview.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Status & Validation */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Status e validação</h2>

            {!document?.columnMapping && (
              <div className="text-sm text-muted-foreground">
                Aguardando o administrador mapear as colunas.
              </div>
            )}

            {document?.columnMapping && !validation && (
              <div className="text-sm text-muted-foreground">
                Mapeamento definido. Aguardando validação/revisão do administrador.
              </div>
            )}

            {validation && (
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium text-foreground">Linhas válidas:</span>{' '}
                  <span className="text-muted-foreground">{validation.validTransactions}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Linhas inválidas:</span>{' '}
                  <span className="text-muted-foreground">{validation.invalidTransactions}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Pode importar (tem linhas válidas):</span>{' '}
                  <span className="text-muted-foreground">{validation.isValid ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            )}

            {validation && validation.errors.length > 0 && (
              <div className="rounded-md border border-border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Linha</TableHead>
                      <TableHead>Campo</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Conteúdo da linha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validation.errors.slice(0, 50).map((e, idx) => (
                      <TableRow key={idx} className="border-border">
                        <TableCell>{e.row}</TableCell>
                        <TableCell>{e.field}</TableCell>
                        <TableCell>{e.message}</TableCell>
                        <TableCell>
                          {e.rowData ? (
                            <pre className="text-xs whitespace-pre-wrap max-w-[700px]">
                              {JSON.stringify(e.rowData, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-xs text-muted-foreground">(sem snapshot)</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Admin Changes */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Alterações do administrador</h2>

            {audit.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhuma alteração registrada ainda.
              </div>
            )}

            {audit.length > 0 && (
              <div className="rounded-md border border-border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Quando</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.map((a, idx) => (
                      <TableRow key={idx} className="border-border">
                        <TableCell className="text-muted-foreground">{new Date(a.at).toLocaleString()}</TableCell>
                        <TableCell className="text-foreground">{a.action}</TableCell>
                        <TableCell>
                          <pre className="text-xs whitespace-pre-wrap max-w-[700px] text-muted-foreground">
                            {JSON.stringify(a.details ?? {}, null, 2)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
