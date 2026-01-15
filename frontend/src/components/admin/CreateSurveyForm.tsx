import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { QuestionBuilder, Question } from './QuestionBuilder';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Plus, Save } from 'lucide-react';
import { adminSurveyService } from '../../services/adminSurveyService';

export function CreateSurveyForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyVersionId, setSurveyVersionId] = useState<string | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      tempId: `temp-${Date.now()}`,
      text: '',
      type: 'TEXT',
      orderIndex: questions.length,
      options: undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (tempId: string, updatedQuestion: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.tempId === tempId ? { ...q, ...updatedQuestion } : q
    ));
  };

  const handleRemoveQuestion = (tempId: string) => {
    setQuestions(questions.filter(q => q.tempId !== tempId));
  };

  const validateForm = (): boolean => {
    if (!surveyTitle.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'Título do questionário é obrigatório',
        variant: 'destructive',
      });
      return false;
    }

    if (surveyTitle.trim().length < 3) {
      toast({
        title: 'Erro de validação',
        description: 'Título deve ter no mínimo 3 caracteres',
        variant: 'destructive',
      });
      return false;
    }

    if (questions.length === 0) {
      toast({
        title: 'Erro de validação',
        description: 'Adicione pelo menos uma pergunta',
        variant: 'destructive',
      });
      return false;
    }

    // Valida cada pergunta
    for (const question of questions) {
      if (!question.text.trim()) {
        toast({
          title: 'Erro de validação',
          description: 'Todas as perguntas devem ter texto',
          variant: 'destructive',
        });
        return false;
      }

      if (question.type === 'DROPDOWN' && (!question.options || question.options.length < 2)) {
        toast({
          title: 'Erro de validação',
          description: 'Perguntas do tipo DROPDOWN devem ter pelo menos 2 opções',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Survey
      console.log('📝 Creating survey:', { title: surveyTitle, description: surveyDescription });
      
      const surveyResponse = await adminSurveyService.createSurvey({
        title: surveyTitle.trim(),
        description: surveyDescription.trim() || undefined,
      });

      console.log('✅ Survey created:', surveyResponse);
      console.log('🆔 Version ID:', surveyResponse.versionId);

      setSurveyVersionId(surveyResponse.versionId);

      // Step 2: Add all questions
      for (const question of questions) {
        console.log('➕ Adding question:', {
          versionId: surveyResponse.versionId,
          question: {
            text: question.text,
            type: question.type,
            orderIndex: question.orderIndex,
          }
        });
        
        await adminSurveyService.addQuestion(surveyResponse.versionId, {
          text: question.text.trim(),
          type: question.type,
          options: question.type === 'DROPDOWN' ? question.options : undefined,
          orderIndex: question.orderIndex,
        });
      }

      toast({
        title: 'Sucesso!',
        description: `Questionário "${surveyTitle}" criado com ${questions.length} perguntas`,
      });

      // Reset form
      setSurveyTitle('');
      setSurveyDescription('');
      setQuestions([]);
      setSurveyVersionId(null);

    } catch (error: any) {
      console.error('Error creating survey:', error);
      toast({
        title: 'Erro ao criar questionário',
        description: error.message || 'Ocorreu um erro ao criar o questionário',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Survey Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título do Questionário *</Label>
          <Input
            id="title"
            placeholder="Ex: Questionário de Maturidade ESG"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            disabled={isLoading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            placeholder="Descrição detalhada do questionário..."
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="mt-1"
          />
        </div>
      </div>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Perguntas ({questions.length})</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddQuestion}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Nenhuma pergunta adicionada. Clique em "Adicionar Pergunta" para começar.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionBuilder
                  key={question.tempId}
                  question={question}
                  questionNumber={index + 1}
                  onUpdate={(updated) => handleUpdateQuestion(question.tempId, updated)}
                  onRemove={() => handleRemoveQuestion(question.tempId)}
                  disabled={isLoading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || questions.length === 0}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Criar Questionário
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
