import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QuestionType = 'DROPDOWN' | 'TEXT' | 'CNPJ' | 'NUMBER' | 'FILE_UPLOAD';

export interface Question {
  tempId: string;
  text: string;
  type: QuestionType;
  orderIndex: number;
  options?: string[];
}

interface QuestionBuilderProps {
  question: Question;
  questionNumber: number;
  onUpdate: (updated: Partial<Question>) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const questionTypeLabels: Record<QuestionType, string> = {
  DROPDOWN: 'Múltipla Escolha',
  TEXT: 'Texto Livre',
  CNPJ: 'CNPJ',
  NUMBER: 'Número',
  FILE_UPLOAD: 'Upload de Arquivo',
};

export function QuestionBuilder({
  question,
  questionNumber,
  onUpdate,
  onRemove,
  disabled = false,
}: QuestionBuilderProps) {
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (!newOption.trim()) return;

    const currentOptions = question.options || [];
    onUpdate({ options: [...currentOptions, newOption.trim()] });
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = question.options || [];
    onUpdate({ options: currentOptions.filter((_, i) => i !== index) });
  };

  const handleTypeChange = (newType: QuestionType) => {
    if (newType === 'DROPDOWN' && !question.options) {
      onUpdate({ type: newType, options: [] });
    } else if (newType !== 'DROPDOWN') {
      onUpdate({ type: newType, options: undefined });
    } else {
      onUpdate({ type: newType });
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="text-orange-600">Pergunta {questionNumber}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Text */}
        <div>
          <Label htmlFor={`question-text-${question.tempId}`}>Texto da Pergunta *</Label>
          <Textarea
            id={`question-text-${question.tempId}`}
            placeholder="Digite a pergunta..."
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            disabled={disabled}
            rows={2}
            className="mt-1"
          />
        </div>

        {/* Question Type */}
        <div>
          <Label htmlFor={`question-type-${question.tempId}`}>Tipo de Pergunta *</Label>
          <Select
            value={question.type}
            onValueChange={handleTypeChange}
            disabled={disabled}
          >
            <SelectTrigger id={`question-type-${question.tempId}`} className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(questionTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Options for DROPDOWN */}
        {question.type === 'DROPDOWN' && (
          <div className="space-y-3">
            <Label>Opções *</Label>
            
            {/* Current Options */}
            {question.options && question.options.length > 0 && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded"
                  >
                    <span className="flex-1 text-sm">{option}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      disabled={disabled}
                      className="h-7 w-7"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Option */}
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma opção..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                disabled={disabled}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                disabled={disabled || !newOption.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {(!question.options || question.options.length < 2) && (
              <p className="text-xs text-orange-600">
                Adicione pelo menos 2 opções para perguntas de múltipla escolha
              </p>
            )}
          </div>
        )}

        {/* Helper text based on type */}
        {question.type === 'TEXT' && (
          <p className="text-xs text-slate-500">
            Usuário poderá inserir texto livre
          </p>
        )}
        {question.type === 'CNPJ' && (
          <p className="text-xs text-slate-500">
            Usuário deverá inserir um CNPJ válido (formato: 12.345.678/0001-90)
          </p>
        )}
        {question.type === 'NUMBER' && (
          <p className="text-xs text-slate-500">
            Usuário poderá inserir apenas números
          </p>
        )}
        {question.type === 'FILE_UPLOAD' && (
          <p className="text-xs text-slate-500">
            Usuário poderá fazer upload de um arquivo
          </p>
        )}
      </CardContent>
    </Card>
  );
}
