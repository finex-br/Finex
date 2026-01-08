import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import type { Question } from '../../types/survey.types';

interface NumberQuestionProps {
  question: Question;
  value?: any;
  comment?: string;
  onChange: (value: any, comment?: string) => void;
}

export const NumberQuestion = ({
  question,
  value,
  comment,
  onChange,
}: NumberQuestionProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    onChange({ number: isNaN(numValue) ? 0 : numValue }, comment);
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
          type="number"
          placeholder="Digite um número..."
          value={value?.number || ''}
          onChange={handleValueChange}
          min={0}
        />
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
