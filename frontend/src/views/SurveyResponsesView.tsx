import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyService } from '../services/surveyService';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import type { AssessmentResponse } from '../types/survey.types';

export const SurveyResponsesView = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);

  useEffect(() => {
    if (!assessmentId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await surveyService.getAssessmentResponses(assessmentId);
        setSurveyTitle(data.surveyTitle);
        setResponses(data.responses);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar respostas');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [assessmentId]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Sem resposta';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
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
        <div className="max-w-3xl mx-auto space-y-6">
          <PageHeader
            breadcrumb="Questionários"
            title={surveyTitle || 'Respostas'}
            subtitle="Visualização das respostas enviadas"
            actions={
              <Button variant="outline" onClick={() => navigate('/surveys')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            }
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {responses.length === 0 && !error && (
            <div className="glass-card p-12 text-center">
              <p className="text-muted-foreground">Nenhuma resposta encontrada.</p>
            </div>
          )}

          <div className="space-y-4">
            {responses.map((r, idx) => (
              <div key={idx} className="glass-card p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                    {r.orderIndex + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.questionText}</p>
                    <span className="text-xs text-muted-foreground uppercase">{r.questionType}</span>
                  </div>
                </div>

                <div className="ml-11 p-3 rounded-lg bg-accent/50 border border-border">
                  <p className="text-sm text-foreground">{formatValue(r.value)}</p>
                </div>

                {r.comment && (
                  <div className="ml-11 flex items-start gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{r.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
