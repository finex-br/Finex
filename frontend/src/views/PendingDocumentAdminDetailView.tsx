import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    headers,
    mapping,
    setMapping,
    isSavingMapping,
    saveMapping,
    validation,
    isValidating,
    validate,
    isApproving,
    approve,
    rejectNotes,
    setRejectNotes,
    isRejecting,
    reject,
    actionMessage,
  } = usePendingDocumentDetailViewModel(documentId);

  const previewRows = useMemo(() => document?.rawData.sampleRows || [], [document]);

  const canApprove = !!validation?.isValid;

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
                <Button onClick={saveMapping} disabled={isSavingMapping || !documentId}>
                  {isSavingMapping ? 'Salvando...' : 'Salvar mapeamento'}
                </Button>
                <Button
                  variant="outline"
                  onClick={validate}
                  disabled={isValidating || !documentId}
                >
                  {isValidating ? 'Validando...' : 'Validar'}
                </Button>
                <Button
                  variant="default"
                  onClick={approve}
                  disabled={isApproving || !documentId || !canApprove}
                >
                  {isApproving ? 'Aprovando...' : 'Aprovar'}
                </Button>
              </div>

              {validation && (
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Válidas:</span> {validation.validTransactions}
                  </div>
                  <div>
                    <span className="font-medium">Inválidas:</span> {validation.invalidTransactions}
                  </div>
                  <div>
                    <span className="font-medium">isValid:</span> {validation.isValid ? 'Sim' : 'Não'}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.errors.slice(0, 50).map((e, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{e.row}</TableCell>
                          <TableCell>{e.field}</TableCell>
                          <TableCell>{e.message}</TableCell>
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
              <CardTitle>Rejeição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Motivo (opcional)"
              />
              <Button variant="destructive" onClick={reject} disabled={isRejecting || !documentId}>
                {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
