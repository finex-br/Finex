import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { usePendingDocumentDetailViewModel } from '@/hooks/usePendingDocumentDetailViewModel';
import { HelpCircle } from 'lucide-react';

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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            breadcrumb="Revisar Documentos"
            title="Documento"
          />

          {/* Document Info */}
          <div className="glass-card p-6 space-y-4">
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

            {isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}

            {document && (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-foreground">Arquivo:</span>{' '}
                  <span className="text-muted-foreground">{document.fileName}</span>
                </div>
                {document.companyId && (
                  <div>
                    <span className="font-medium text-foreground">Empresa:</span>{' '}
                    <span className="text-muted-foreground">{document.companyId}</span>
                  </div>
                )}
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

          {/* Mapping */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Mapeamento</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Associe as colunas do seu arquivo às colunas do sistema para validação e importação.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Data</div>
                <Select
                  modal={false}
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
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Valor</div>
                <Select
                  modal={false}
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
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Descrição</div>
                <Select
                  modal={false}
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
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Categoria</div>
                <Select
                  modal={false}
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
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">Tipo</div>
                <Select
                  modal={false}
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
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={saveMapping} disabled={isSavingMapping || !documentId || !isSystemAdmin}>
                    {isSavingMapping ? 'Salvando...' : 'Salvar mapeamento'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Salva a associação de colunas atual para uso na validação.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={validate}
                    disabled={isValidating || !documentId || !isSystemAdmin}
                  >
                    {isValidating ? 'Validando...' : 'Validar'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verifica quantas linhas são válidas com o mapeamento atual.</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={approve}
                    disabled={isApproving || !documentId || !canApprove}
                  >
                    {isApproving ? 'Aprovando...' : 'Aprovar e importar'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Importa as linhas válidas para o sistema. Esta ação não pode ser desfeita.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {validation && (
              <div className="space-y-3">
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Linhas que serão importadas (válidas):</span>{' '}
                    {validation.validTransactions}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Linhas com erro (não importadas):</span>{' '}
                    {validation.invalidTransactions}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Pode importar agora (tem linhas válidas):</span>{' '}
                    {validation.isValid ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Documento 100% válido (sem erros):</span>{' '}
                    {isHundredPercentValid ? 'Sim' : 'Não'}
                  </div>
                  <div className="text-xs">
                    "Válidas" são as linhas que podem ser convertidas para transações com o mapeamento atual.
                    "Inválidas" são linhas que falharam (ex.: data/valor inválidos) e serão ignoradas ao aprovar.
                    Linhas totalmente vazias no Excel são ignoradas no upload e não aparecem como erro.
                  </div>
                </div>

                {!canApproveByData && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Nenhuma linha válida para importar. Ajuste o mapeamento e clique em "Validar" novamente.
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
                  <div className="text-xs text-muted-foreground">
                    Avisos: {validation.warnings.length} (a importação pode continuar).
                  </div>
                )}
              </div>
            )}

            {!hasAnyValidation && (
              <div className="text-sm text-muted-foreground">
                Dica: primeiro salve o mapeamento (Data e Valor), depois clique em "Validar" para ver quantas
                linhas serão importadas.
              </div>
            )}

            {validation && validation.errors.length > 0 && (
              <>
                <div className="text-sm font-medium text-foreground">Erros de validação (primeiros 50)</div>
                <div className="text-xs text-muted-foreground">
                  "Linha" é o número da linha no Excel (inclui o cabeçalho na linha 1).
                </div>
                <div className="rounded-md border border-border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Linha</TableHead>
                        <TableHead>Campo</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Conteúdo da linha</TableHead>
                        {isSystemAdmin && <TableHead>Ação</TableHead>}
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
                              <span className="text-xs text-muted-foreground">
                                (Sem snapshot da linha — reenvie o arquivo para capturar as linhas do Excel)
                              </span>
                            )}
                          </TableCell>
                          {isSystemAdmin && (
                            <TableCell>
                              {excludedRows.includes(e.row) ? (
                                <span className="text-xs text-muted-foreground">Excluída</span>
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
              </>
            )}

            {validation && validation.errors.length > 0 && isSystemAdmin && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Corrigir linhas com erro</h3>
                <div className="text-sm text-muted-foreground">
                  Preencha os campos obrigatórios para as linhas com erro e salve. Em seguida, o sistema
                  revalida automaticamente.
                </div>

                <div className="rounded-md border border-border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
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
                          <TableRow key={key} className="border-border">
                            <TableCell>{rowNumber}</TableCell>
                            <TableCell>
                              {entry?.rowData ? (
                                <pre className="text-xs whitespace-pre-wrap max-w-[520px]">
                                  {JSON.stringify(entry.rowData, null, 2)}
                                </pre>
                              ) : (
                                <span className="text-xs text-muted-foreground">(sem dados)</span>
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
              </div>
            )}
          </div>

          {/* Rejection */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Rejeição</h2>
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
