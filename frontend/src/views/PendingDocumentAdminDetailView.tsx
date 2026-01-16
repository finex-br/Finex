import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePendingDocumentDetailViewModel } from '@/hooks/usePendingDocumentDetailViewModel';

const NONE = '__NONE__';

export function PendingDocumentAdminDetailView() {
  const { id } = useParams();
  const documentId = id || '';

  const {
    isLoading,
    error,
    document,
    isSystemAdmin,
    headers,
    mapping,
    setMapping,
    isSavingMapping,
    saveMapping,
    validation,
    isValidating,
    validate,

    rowOverrides,
    setRowOverrides,
    isSavingOverrides,
    saveOverrides,

    excludedRows,
    isExcludingRows,
    excludeRow,
    isApproving,
    approve,
    rejectNotes,
    setRejectNotes,
    isRejecting,
    reject,
    actionMessage,
  } = usePendingDocumentDetailViewModel(documentId);

  const previewRows = useMemo(() => document?.rawData.sampleRows || [], [document]);

  const canApproveByData = (validation?.validTransactions || 0) > 0;
  const canApproveByRole = isSystemAdmin;
  const canApprove = canApproveByData && canApproveByRole;
  const hasAnyValidation = !!validation;
  const hasErrors = (validation?.errors?.length || 0) > 0;
  const hasWarnings = (validation?.warnings?.length || 0) > 0;
  const isHundredPercentValid =
    hasAnyValidation && (validation?.invalidTransactions || 0) === 0 && !hasErrors;

  const groupedErrorRows = useMemo(() => {
    const rows = new Set<number>();
    (validation?.errors || []).forEach((e) => rows.add(e.row));
    return Array.from(rows).sort((a, b) => a - b);
  }, [validation]);

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

              {actionMessage && (
                <Alert>
                  <AlertDescription>{actionMessage}</AlertDescription>
                </Alert>
              )}

              {isLoading && <div className="text-sm text-slate-500">Carregando...</div>}

              {document && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Arquivo:</span> {document.fileName}
                  </div>
                  {document.companyId && (
                    <div>
                      <span className="font-medium">Empresa:</span> {document.companyId}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Status:</span> {document.status}
                  </div>
                  <div>
                    <span className="font-medium">Total de linhas:</span> {document.rawData.totalRows}
                  </div>
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
              <CardTitle>Mapeamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Data (obrigatório)</div>
                  <Select
                    value={mapping.date || NONE}
                    onValueChange={(value) =>
                      setMapping((prev) => ({ ...prev, date: value === NONE ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>—</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Valor (obrigatório)</div>
                  <Select
                    value={mapping.amount || NONE}
                    onValueChange={(value) =>
                      setMapping((prev) => ({ ...prev, amount: value === NONE ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>—</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Descrição (opcional)</div>
                  <Select
                    value={mapping.description || NONE}
                    onValueChange={(value) =>
                      setMapping((prev) => ({ ...prev, description: value === NONE ? undefined : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>—</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Categoria (opcional)</div>
                  <Select
                    value={mapping.category || NONE}
                    onValueChange={(value) =>
                      setMapping((prev) => ({ ...prev, category: value === NONE ? undefined : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>—</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Tipo (opcional)</div>
                  <Select
                    value={mapping.type || NONE}
                    onValueChange={(value) =>
                      setMapping((prev) => ({ ...prev, type: value === NONE ? undefined : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>—</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveMapping} disabled={isSavingMapping || !documentId || !isSystemAdmin}>
                  {isSavingMapping ? 'Salvando...' : 'Salvar mapeamento'}
                </Button>
                <Button
                  variant="outline"
                  onClick={validate}
                  disabled={isValidating || !documentId || !isSystemAdmin}
                >
                  {isValidating ? 'Validando...' : 'Validar'}
                </Button>
                <Button
                  variant="default"
                  onClick={approve}
                  disabled={isApproving || !documentId || !canApprove}
                >
                  {isApproving ? 'Aprovando...' : 'Aprovar e importar'}
                </Button>
              </div>

              {validation && (
                <div className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Linhas que serão importadas (válidas):</span>{' '}
                      {validation.validTransactions}
                    </div>
                    <div>
                      <span className="font-medium">Linhas com erro (não importadas):</span>{' '}
                      {validation.invalidTransactions}
                    </div>
                    <div>
                      <span className="font-medium">Pode importar agora (tem linhas válidas):</span>{' '}
                      {validation.isValid ? 'Sim' : 'Não'}
                    </div>
                    <div>
                      <span className="font-medium">Documento 100% válido (sem erros):</span>{' '}
                      {isHundredPercentValid ? 'Sim' : 'Não'}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      “Válidas” são as linhas que podem ser convertidas para transações com o mapeamento atual.
                      “Inválidas” são linhas que falharam (ex.: data/valor inválidos) e serão ignoradas ao aprovar.
                      Linhas totalmente vazias no Excel são ignoradas no upload e não aparecem como erro.
                    </div>
                  </div>

                  {!canApproveByData && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Nenhuma linha válida para importar. Ajuste o mapeamento e clique em “Validar” novamente.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!canApproveByRole && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Somente administradores do sistema (role: ADMIN) podem aprovar, corrigir ou excluir linhas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {canApproveByData && hasErrors && (
                    <Alert>
                      <AlertDescription>
                        Você pode aprovar agora e importar apenas as {validation.validTransactions} linhas válidas,
                        ou ajustar o mapeamento e validar novamente para tentar reduzir erros.
                      </AlertDescription>
                    </Alert>
                  )}

                  {canApproveByData && !hasErrors && (
                    <Alert>
                      <AlertDescription>
                        Validação sem erros. Ao aprovar, serão importadas {validation.validTransactions} linhas.
                      </AlertDescription>
                    </Alert>
                  )}

                  {hasWarnings && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Avisos: {validation.warnings.length} (a importação pode continuar).
                    </div>
                  )}
                </div>
              )}

              {!hasAnyValidation && (
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Dica: primeiro salve o mapeamento (Data e Valor), depois clique em “Validar” para ver quantas
                  linhas serão importadas.
                </div>
              )}

              {validation && validation.errors.length > 0 && (
                <div className="text-sm font-medium">Erros de validação (primeiros 50)</div>
              )}

              {validation && validation.errors.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  “Linha” é o número da linha no Excel (inclui o cabeçalho na linha 1).
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
                        {isSystemAdmin && <TableHead>Ação</TableHead>}
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
                              <span className="text-xs text-slate-500">
                                (Sem snapshot da linha — reenvie o arquivo para capturar as linhas do Excel)
                              </span>
                            )}
                          </TableCell>
                          {isSystemAdmin && (
                            <TableCell>
                              {excludedRows.includes(e.row) ? (
                                <span className="text-xs text-slate-500">Excluída</span>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isExcludingRows}
                                  onClick={() => excludeRow(e.row)}
                                >
                                  {isExcludingRows ? 'Excluindo...' : 'Excluir linha'}
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {validation && validation.errors.length > 0 && isSystemAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Corrigir linhas com erro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      Preencha os campos obrigatórios para as linhas com erro e salve. Em seguida, o sistema
                      revalida automaticamente.
                    </div>

                    <div className="rounded-md border bg-white dark:bg-slate-950 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Linha</TableHead>
                            <TableHead>Conteúdo da linha</TableHead>
                            <TableHead>Data (override)</TableHead>
                            <TableHead>Valor (override)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedErrorRows.map((rowNumber) => {
                            const key = String(rowNumber);
                            const current = rowOverrides[key] || {};
                            const entry = (validation?.errors || []).find((e) => e.row === rowNumber);

                            return (
                              <TableRow key={key}>
                                <TableCell>{rowNumber}</TableCell>
                                <TableCell>
                                  {entry?.rowData ? (
                                    <pre className="text-xs whitespace-pre-wrap max-w-[520px]">
                                      {JSON.stringify(entry.rowData, null, 2)}
                                    </pre>
                                  ) : (
                                    <span className="text-xs text-slate-500">(sem dados)</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={current.date || ''}
                                    onChange={(e) =>
                                      setRowOverrides((prev) => ({
                                        ...prev,
                                        [key]: { ...prev[key], date: e.target.value },
                                      }))
                                    }
                                    placeholder="2025-01-10"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={current.amount || ''}
                                    onChange={(e) =>
                                      setRowOverrides((prev) => ({
                                        ...prev,
                                        [key]: { ...prev[key], amount: e.target.value },
                                      }))
                                    }
                                    placeholder="123,45"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveOverrides} disabled={isSavingOverrides || !documentId}>
                        {isSavingOverrides ? 'Salvando...' : 'Salvar correções e revalidar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rejeição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Motivo (opcional)"
                disabled={!isSystemAdmin}
              />
              <Button
                variant="destructive"
                onClick={reject}
                disabled={isRejecting || !documentId || !isSystemAdmin}
              >
                {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
