import { useState } from 'react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Upload, X, FileIcon } from 'lucide-react';
import type { Question } from '../../types/survey.types';

interface FileUploadQuestionProps {
  question: Question;
  value?: any;
  comment?: string;
  onChange: (value: any, comment?: string) => void;
}

export const FileUploadQuestion = ({
  question,
  value,
  comment,
  onChange,
}: FileUploadQuestionProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(value?.fileIds || []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // TODO: Implementar upload real quando backend estiver pronto
      // Por enquanto, simula upload
      const fileIds = Array.from(files).map(() => `file-${Date.now()}-${Math.random()}`);
      
      const newFileIds = [...uploadedFiles, ...fileIds];
      setUploadedFiles(newFileIds);
      onChange({ fileIds: newFileIds }, comment);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const newFileIds = uploadedFiles.filter((id) => id !== fileId);
    setUploadedFiles(newFileIds);
    onChange({ fileIds: newFileIds }, comment);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(value, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{question.text}</Label>
        
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            id={question.id}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <label htmlFor={question.id} className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {uploading ? 'Enviando...' : 'Clique para selecionar arquivos'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(question.id)?.click();
              }}
            >
              Selecionar Arquivos
            </Button>
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium">Arquivos enviados:</p>
            <div className="space-y-2">
              {uploadedFiles.map((fileId) => (
                <div
                  key={fileId}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    <span className="text-sm">{fileId}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(fileId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${question.id}-comment`}>
          Comentário (opcional)
        </Label>
        <Textarea
          id={`${question.id}-comment`}
          placeholder="Adicione um comentário..."
          value={comment || ''}
          onChange={handleCommentChange}
          rows={2}
        />
      </div>
    </div>
  );
};
