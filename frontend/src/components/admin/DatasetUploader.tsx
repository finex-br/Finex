import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DatasetUploaderProps {
  onUpload: (file: File, name: string) => void;
  isLoading?: boolean;
  accept?: string;
}

const DEFAULT_ACCEPT = '.csv,.xlsx,.xls';

export function DatasetUploader({
  onUpload,
  isLoading = false,
  accept = DEFAULT_ACCEPT,
}: DatasetUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    if (!datasetName) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setDatasetName(nameWithoutExtension);
    }
  }, [datasetName]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setDatasetName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !datasetName.trim()) return;
    onUpload(selectedFile, datasetName.trim());
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleBrowseClick}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          isLoading && 'pointer-events-none opacity-50',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileSpreadsheet className="h-10 w-10 text-primary" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Arraste e solte o arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground">
              ou clique para selecionar. Aceita CSV, XLSX, XLS
            </p>
          </div>
        )}
      </div>

      {/* Dataset name input */}
      {selectedFile && (
        <div className="space-y-2">
          <Label htmlFor="dataset-name">Nome do Dataset</Label>
          <Input
            id="dataset-name"
            placeholder="Nome do dataset..."
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Upload button */}
      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={isLoading || !datasetName.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Enviar Dataset
            </>
          )}
        </Button>
      )}
    </div>
  );
}
