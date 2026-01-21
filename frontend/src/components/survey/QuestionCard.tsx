import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
            comment={comment}
            onChange={onChange}
          />
        );
      case 'TEXT':
        return (
          <TextQuestion
            question={question}
            value={value}
            comment={comment}
            onChange={onChange}
          />
        );
      case 'CNPJ':
        return (
          <CNPJQuestion
            question={question}
            value={value}
            comment={comment}
            onChange={onChange}
          />
        );
      case 'NUMBER':
        return (
          <NumberQuestion
            question={question}
            value={value}
            comment={comment}
            onChange={onChange}
          />
        );
      case 'FILE_UPLOAD':
        return (
          <FileUploadQuestion
            question={question}
            value={value}
            comment={comment}
            onChange={onChange}
          />
        );
      default:
        return <p className="text-muted-foreground">Tipo de pergunta não suportado</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Pergunta {questionNumber}
          {(question.currentAnswer || isSaved) && (
            <span className="ml-2 text-sm font-normal text-green-600">✓ Respondida</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>{renderQuestion()}</CardContent>
    </Card>
  );
};
