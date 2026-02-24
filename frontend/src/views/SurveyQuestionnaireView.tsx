import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyAssessment } from '../hooks/useSurveyAssessment';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { QuestionCard } from '../components/survey/QuestionCard';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';

export const SurveyQuestionnaireView = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const {
    questionsPage,
    currentPage,
    answers,
    loading,
    saving,
    error,
    savedQuestionIds,
    updateAnswer,
    saveAnswers,
    nextPage,
    previousPage,
    completeAssessment,
    hasNextPage,
    hasPreviousPage,
    isComplete,
  } = useSurveyAssessment({ assessmentId: assessmentId || '' });

  if (!assessmentId) {
    navigate('/surveys');
    return null;
  }

  const handleSave = async () => {
    try {
      await saveAnswers();
      toast({
        title: 'Respostas salvas',
        description: 'Suas respostas foram salvas com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as respostas. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async () => {
    try {
      await completeAssessment();
      toast({
        title: 'Questionário completo!',
        description: 'Você completou o questionário com sucesso.',
      });
      navigate('/surveys');
    } catch (error: any) {
      toast({
        title: 'Erro ao completar',
        description: error.message || 'Não foi possível completar o questionário.',
        variant: 'destructive',
      });
    }
  };

  if (loading && !questionsPage) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!questionsPage) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <Alert variant="destructive">
            <AlertDescription>
              Não foi possível carregar o questionário.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  const startIndex = (currentPage - 1) * 5;

  return (
    <AppLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back + Header */}
          <Button
            variant="ghost"
            onClick={() => navigate('/surveys')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para listagem
          </Button>

          <PageHeader
            title="Questionário"
          />

          {/* Progress */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {questionsPage.totalPages}
              </span>
              <div className="flex items-center gap-2">
                {saving && (
                  <span className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Salvando...
                  </span>
                )}
                <span className="text-sm font-medium text-foreground">{questionsPage.progress}% completo</span>
              </div>
            </div>
            <Progress value={questionsPage.progress} className="h-2" />
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Questions */}
          <div className="space-y-6 mb-6">
            {questionsPage.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={startIndex + index + 1}
                value={answers[question.id]?.value}
                comment={answers[question.id]?.comment}
                isSaved={savedQuestionIds.has(question.id)}
                onChange={(value, comment) => updateAnswer(question.id, value, comment)}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between sticky bottom-0 glass-card p-4 border-t border-border">
            <Button
              variant="outline"
              onClick={previousPage}
              disabled={!hasPreviousPage || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="text-sm text-muted-foreground">
              {saving && (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Salvando automaticamente...
                </span>
              )}
            </div>

            {hasNextPage ? (
              <Button onClick={nextPage} disabled={loading}>
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowCompleteDialog(true)}
                disabled={!isComplete || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            )}
          </div>

          {/* Complete Dialog */}
          {showCompleteDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="glass-card p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-foreground mb-4">Finalizar Questionário</h2>
                <p className="text-muted-foreground mb-6">
                  Você está prestes a finalizar o questionário. Após finalizar, não será mais
                  possível alterar as respostas. Deseja continuar?
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCompleteDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Sim, Finalizar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
