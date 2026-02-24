import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, FileText, PlayCircle, Info } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import { useAuthStore } from '../store/authStore';
import type { Survey } from '../types/survey.types';

export const SurveysListView = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [showIntroBanner, setShowIntroBanner] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const firstLoginKey = `finex-first-login-${user.id}`;
      const completedSurveysKey = `finex-surveys-intro-dismissed-${user.id}`;
      const isFirstLogin = localStorage.getItem(firstLoginKey);
      const dismissed = localStorage.getItem(completedSurveysKey);
      if (isFirstLogin && !dismissed) {
        setShowIntroBanner(true);
      }
    }
  }, [user?.id]);

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
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Questionários"
            subtitle="Complete os questionários disponíveis para sua empresa"
          />

          {/* First Access Intro Banner */}
          {showIntroBanner && (
            <Alert className="bg-primary/10 border-primary/30">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="flex items-center justify-between">
                <span>Antes de prosseguir, responda a estas breves perguntas para que possamos conhecer melhor sua empresa.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4 shrink-0"
                  onClick={() => {
                    if (user?.id) {
                      localStorage.setItem(`finex-surveys-intro-dismissed-${user.id}`, 'true');
                    }
                    setShowIntroBanner(false);
                  }}
                >
                  Fechar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {surveys.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum questionário disponível no momento
              </p>
            </div>
          ) : (
            /* Surveys Grid */
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {surveys.map((survey) => (
                <div key={survey.surveyId} className="glass-card-hover p-6 space-y-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <FileText className="h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="line-clamp-2">{survey.title}</span>
                    </h3>
                    {survey.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {survey.description}
                      </p>
                    )}
                  </div>

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
                    className="w-full"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
