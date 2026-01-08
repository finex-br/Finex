import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { Question } from '../../types/survey.types';

interface TextQuestionProps {
  question: Question;
  value?: any;
  comment?: string;
  onChange: (value: any, comment?: string) => void;
}

export const TextQuestion = ({
  question,
  value,
  comment,
  onChange,
}: TextQuestionProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ text: e.target.value }, comment);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(value, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={question.id}>{question.text}</Label>
        <Textarea
          id={question.id}
          placeholder="Digite sua resposta..."
          value={value?.text || ''}
          onChange={handleValueChange}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${question.id}-comment`}>
          Comentário adicional (opcional)
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
