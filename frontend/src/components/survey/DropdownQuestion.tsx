import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { Question } from '../../types/survey.types';

interface DropdownQuestionProps {
  question: Question;
  value?: any;
  onChange: (value: any, comment?: string) => void;
}

export const DropdownQuestion = ({
  question,
  value,
  onChange,
}: DropdownQuestionProps) => {
  const handleValueChange = (newValue: string) => {
    onChange({ selected: newValue });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id}>{question.text}</Label>
      <Select
        value={value?.selected || ''}
        onValueChange={handleValueChange}
      >
        <SelectTrigger id={question.id}>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {question.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
