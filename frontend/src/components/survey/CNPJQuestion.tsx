import { Label } from '../ui/label';
import { Input } from '../ui/input';
import type { Question } from '../../types/survey.types';

interface CNPJQuestionProps {
  question: Question;
  value?: any;
  onChange: (value: any, comment?: string) => void;
}

export const CNPJQuestion = ({
  question,
  value,
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
    onChange({ cnpj: formatted });
  };

  return (
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
  );
};
