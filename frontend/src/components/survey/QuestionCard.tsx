import { Card, CardContent } from '../ui/card';
import { DropdownQuestion } from './DropdownQuestion';
import { TextQuestion } from './TextQuestion';
import { CNPJQuestion } from './CNPJQuestion';
import { NumberQuestion } from './NumberQuestion';
import { FileUploadQuestion } from './FileUploadQuestion';
import type { Question } from '../../types/survey.types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  value?: any;
  comment?: string;
  isSaved?: boolean;
  onChange: (value: any, comment?: string) => void;
}

export const QuestionCard = ({
  question,
  questionNumber,
  value,
  comment,
  isSaved = false,
  onChange,
}: QuestionCardProps) => {
  const renderQuestion = () => {
    switch (question.type) {
      case 'DROPDOWN':
        return (
          <DropdownQuestion
            question={question}
            value={value}
            onChange={onChange}
          />
        );
      case 'TEXT':
        return (
          <TextQuestion
            question={question}
            value={value}
            onChange={onChange}
          />
        );
      case 'CNPJ':
        return (
          <CNPJQuestion
            question={question}
            value={value}
            onChange={onChange}
          />
        );
      case 'NUMBER':
        return (
          <NumberQuestion
            question={question}
            value={value}
            onChange={onChange}
          />
        );
      case 'FILE_UPLOAD':
        return (
          <FileUploadQuestion
            question={question}
            value={value}
            onChange={onChange}
          />
        );
      default:
        return <p className="text-muted-foreground">Tipo de pergunta não suportado</p>;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {isSaved && (
          <span className="text-sm font-normal text-green-600 mb-2 block">✓ Respondida</span>
        )}
        {renderQuestion()}
      </CardContent>
    </Card>
  );
};
