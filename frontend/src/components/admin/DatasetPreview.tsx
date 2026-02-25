import { useRef } from 'react';
import { Download, RefreshCw, Loader2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ColumnInfo {
  name: string;
  type: string;
  sampleValues?: string[];
}

interface DatasetPreviewProps {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  totalRows: number;
  datasetName: string;
  onDownload?: () => void;
  onReupload?: (file: File) => void;
  isLoading?: boolean;
}

const typeVariantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
  string: 'secondary',
  number: 'default',
  date: 'outline',
  boolean: 'outline',
};

export function DatasetPreview({
  columns,
  rows,
  totalRows,
  datasetName,
  onDownload,
  onReupload,
  isLoading = false,
}: DatasetPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReuploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReupload) {
      onReupload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{datasetName}</h3>
          <Badge variant="secondary" className="text-xs">
            {totalRows.toLocaleString('pt-BR')} linhas
          </Badge>
          <Badge variant="outline" className="text-xs">
            {columns.length} colunas
          </Badge>
        </div>

        <div className="flex gap-2">
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          )}
          {onReupload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={handleReuploadClick}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reenviar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="rounded-md border">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.name} className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{col.name}</span>
                      <Badge
                        variant={typeVariantMap[col.type] ?? 'outline'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {col.type}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhuma linha para exibir
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {columns.map((col) => (
                      <TableCell key={col.name} className="whitespace-nowrap">
                        {row[col.name] != null ? String(row[col.name]) : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Footer */}
      {rows.length < totalRows && (
        <p className="text-xs text-muted-foreground text-center">
          Exibindo {rows.length} de {totalRows.toLocaleString('pt-BR')} linhas
        </p>
      )}
    </div>
  );
}
