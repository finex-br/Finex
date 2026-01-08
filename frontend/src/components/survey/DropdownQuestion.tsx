import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import type { Question } from '../../types/survey.types';

interface DropdownQuestionProps {
  question: Question;
  value?: any;
  comment?: string;
  onChange: (value: any, comment?: string) => void;
}

export const DropdownQuestion = ({
  question,
  value,
  comment,
  onChange,
}: DropdownQuestionProps) => {
  const handleValueChange = (newValue: string) => {
    onChange({ selected: newValue }, comment);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(value, e.target.value);
  };

  return (
    <div className="space-y-4">
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
