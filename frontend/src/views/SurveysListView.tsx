import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, FileText, PlayCircle } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Questionários</h1>
          <p className="text-muted-foreground">
            Complete os questionários disponíveis para sua empresa
          </p>
        </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
        <div className="grid gap-6 md:grid-cols-2">
          {surveys.map((survey) => (
            <Card key={survey.surveyId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {survey.title}
                </CardTitle>
                <CardDescription>{survey.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {survey.hasStarted && survey.progress !== undefined ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{survey.progress}%</span>
                    </div>
                    <Progress value={survey.progress} />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </AppLayout>
  );
};
