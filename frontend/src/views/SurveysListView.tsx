import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, FileText, PlayCircle, Clock } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import type { Survey } from '../types/survey.types';

export const SurveysListView = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await surveyService.getPendingSurveys();
      setSurveys(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar questionários');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSurvey = async (survey: Survey) => {
    setStartingId(survey.surveyId);
    try {
      const assessment = await surveyService.startAssessment(survey.surveyId);
      navigate(`/surveys/${assessment.assessmentId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao iniciar questionário');
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="mb-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="surface-elevated p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          <PageHeader
            title="Questionários"
            subtitle="Complete os questionários disponíveis para sua empresa"
          />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {surveys.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum questionário disponível no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Surveys Grid */
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {surveys.map((survey) => (
                <Card key={survey.surveyId} className="surface-elevated overflow-hidden transition-all duration-200 hover:translate-y-[-1px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <FileText className="h-5 w-5 flex-shrink-0" />
                      <span className="line-clamp-2">{survey.title}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {survey.description}
                    </CardDescription>
                    {survey.estimatedTimeMinutes && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{survey.estimatedTimeMinutes} min</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {survey.hasStarted && survey.progress !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium text-foreground">
                            {survey.progress}%
                          </span>
                        </div>
                        <Progress value={survey.progress} className="h-2" />
                      </div>
                    ) : null}

                    <Button
                      onClick={() => handleStartSurvey(survey)}
                      disabled={startingId === survey.surveyId}
                      className="w-full cursor-pointer"
                    >
                      {startingId === survey.surveyId ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {survey.hasStarted ? 'Continuar' : 'Iniciar'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
