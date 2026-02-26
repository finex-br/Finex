import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, CheckCircle, Filter, Eye, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { adminSurveyService, CompletedAssessment } from '../../services/adminSurveyService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AssessmentResponseItem {
  questionText: string;
  questionType: string;
  orderIndex: number;
  value: any;
  comment: string | null;
}

export function CompletedAssessmentsList() {
  const [assessments, setAssessments] = useState<CompletedAssessment[]>([]);
  const [surveys, setSurveys] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');

  // Expanded responses
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responses, setResponses] = useState<AssessmentResponseItem[]>([]);
  const [responsesTitle, setResponsesTitle] = useState('');
  const [responsesCompany, setResponsesCompany] = useState('');
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAssessments();
  }, [selectedSurvey]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const surveysData = await adminSurveyService.getAllSurveys();
      setSurveys(surveysData.surveys);
      await loadAssessments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async () => {
    try {
      const filters: { surveyId?: string } = {};
      if (selectedSurvey !== 'all') {
        filters.surveyId = selectedSurvey;
      }
      const data = await adminSurveyService.getCompletedAssessments(filters);
      setAssessments(data.assessments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar respostas');
    }
  };

  const handleToggleResponses = async (assessmentId: string) => {
    if (expandedId === assessmentId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(assessmentId);
    setLoadingResponses(true);
    setResponses([]);
    try {
      const data = await adminSurveyService.getAssessmentResponses(assessmentId);
      setResponses(data.responses);
      setResponsesTitle(data.surveyTitle);
      setResponsesCompany(data.companyName);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar respostas do assessment');
      setExpandedId(null);
    } finally {
      setLoadingResponses(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Sem resposta';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Questionário</label>
              <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os questionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os questionários</SelectItem>
                  {surveys.map((survey) => (
                    <SelectItem key={survey.id} value={survey.id}>
                      {survey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Nenhum questionário respondido encontrado
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{assessment.surveyTitle}</h3>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completo
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Empresa:</span>
                        <p className="font-medium">{assessment.companyName}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Progresso:</span>
                        <p className="font-medium">{assessment.progress}%</p>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Completado:</span>
                        <p className="font-medium">
                          {formatDistanceToNow(new Date(assessment.completedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleResponses(assessment.id)}
                  >
                    {expandedId === assessment.id ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Fechar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Respostas
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Responses */}
                {expandedId === assessment.id && (
                  <div className="mt-6 border-t border-border pt-4">
                    {loadingResponses ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : responses.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma resposta encontrada.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {responses.map((r, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                              {r.orderIndex + 1}
                            </span>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-sm font-medium text-foreground">{r.questionText}</p>
                              <div className="p-2 rounded bg-background border border-border">
                                <p className="text-sm text-foreground">{formatValue(r.value)}</p>
                              </div>
                              {r.comment && (
                                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  <p>{r.comment}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
