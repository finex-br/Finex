import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import type { Question } from '../../types/survey.types';

interface CNPJQuestionProps {
  question: Question;
  value?: any;
  comment?: string;
  onChange: (value: any, comment?: string) => void;
}

export const CNPJQuestion = ({
  question,
  value,
  comment,
  onChange,
}: CNPJQuestionProps) => {
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    onChange({ cnpj: formatted }, comment);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(value, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={question.id}>{question.text}</Label>
        <Input
          id={question.id}
          type="text"
          placeholder="00.000.000/0000-00"
          value={value?.cnpj || ''}
          onChange={handleValueChange}
          maxLength={18}
        />
        <p className="text-xs text-muted-foreground">
          Formato: XX.XXX.XXX/XXXX-XX
        </p>
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
