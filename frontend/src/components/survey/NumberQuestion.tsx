import { Label } from '../ui/label';
import { Input } from '../ui/input';
import type { Question } from '../../types/survey.types';

interface NumberQuestionProps {
  question: Question;
  value?: any;
  onChange: (value: any, comment?: string) => void;
}

export const NumberQuestion = ({
  question,
  value,
  onChange,
}: NumberQuestionProps) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    onChange({ number: isNaN(numValue) ? 0 : numValue });
  };

  return (
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
  );
};
