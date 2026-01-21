import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, CheckCircle, Filter } from 'lucide-react';
import { adminSurveyService, CompletedAssessment } from '../../services/adminSurveyService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CompletedAssessmentsList() {
  const [assessments, setAssessments] = useState<CompletedAssessment[]>([]);
  const [surveys, setSurveys] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');

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
      // Load surveys for filter
      const surveysData = await adminSurveyService.getAllSurveys();
      setSurveys(surveysData.surveys);

      // Load assessments
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
                  
                  <Button variant="outline" size="sm" disabled>
                    Ver Respostas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
