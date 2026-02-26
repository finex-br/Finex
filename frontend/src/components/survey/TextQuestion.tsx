import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { Question } from '../../types/survey.types';

interface TextQuestionProps {
  question: Question;
  value?: any;
  onChange: (value: any, comment?: string) => void;
}

export const TextQuestion = ({
  question,
  value,
  onChange,
}: TextQuestionProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ text: e.target.value });
  };

  return (
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
  );
};
