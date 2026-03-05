import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyAssessment } from '../hooks/useSurveyAssessment';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent } from '../components/ui/card';
import { QuestionCard } from '../components/survey/QuestionCard';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { AppLayout } from '../components/AppLayout';

export const SurveyQuestionnaireView = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  if (!assessmentId) {
    navigate('/surveys');
    return null;
  }

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
  } = useSurveyAssessment({ assessmentId });

  const handleTransition = useCallback(async (navigateFn: () => Promise<void>) => {
    setTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await navigateFn();
    await new Promise((resolve) => setTimeout(resolve, 50));
    setTransitioning(false);
  }, []);

  const handleNext = () => handleTransition(nextPage);
  const handlePrevious = () => handleTransition(previousPage);

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
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!questionsPage) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertDescription>
            Não foi possível carregar o questionário.
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  const question = questionsPage.questions[0];

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/surveys')}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar para listagem
            </Button>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Questionário
                </h1>
                {saving && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Salvando...
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Pergunta {currentPage} de {questionsPage.totalPages}
                  </span>
                  <span>{questionsPage.progress}% completo</span>
                </div>
                <Progress value={questionsPage.progress} className="h-1.5" />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Single Question - Centered with transition */}
          <div className="flex items-center justify-center min-h-[50vh]">
            <div
              className={`w-full transition-all duration-300 ease-in-out ${
                transitioning
                  ? 'opacity-0 translate-y-4'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              {question && (
                <Card className="shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    <QuestionCard
                      question={question}
                      questionNumber={currentPage}
                      value={answers[question.id]?.value}
                      comment={answers[question.id]?.comment}
                      isSaved={savedQuestionIds.has(question.id)}
                      onChange={(value, comment) => updateAnswer(question.id, value, comment)}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pb-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!hasPreviousPage || loading || transitioning}
              size="lg"
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
              <Button
                onClick={handleNext}
                disabled={loading || transitioning}
                size="lg"
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowCompleteDialog(true)}
                disabled={!isComplete || loading || transitioning}
                size="lg"
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
              <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
                <h2 className="text-xl font-bold mb-4">Finalizar Questionário</h2>
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
