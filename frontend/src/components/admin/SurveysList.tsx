import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, FileText, CheckCircle, XCircle, Edit, Trash2, Clock } from 'lucide-react';
import { adminSurveyService } from '../../services/adminSurveyService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Survey {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  estimatedTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export function SurveysList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSurveyService.getAllSurveys();
      setSurveys(data.surveys);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar questionários');
    } finally {
      setLoading(false);
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

  if (surveys.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Nenhum questionário criado ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <Card key={survey.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {survey.title}
                  {survey.isActive ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-2">{survey.description}</CardDescription>
                <div className="flex items-center gap-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{survey.estimatedTimeMinutes} min</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Criado{' '}
                {formatDistanceToNow(new Date(survey.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
