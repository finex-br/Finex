import { useState, useCallback, useEffect } from 'react';
import { surveyService } from '../services/surveyService';
import type { Assessment, QuestionsPage, AnswerInput } from '../types/survey.types';

interface UseSurveyAssessmentProps {
  assessmentId: string;
}

export const useSurveyAssessment = ({ assessmentId }: UseSurveyAssessmentProps) => {
  const [questionsPage, setQuestionsPage] = useState<QuestionsPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, AnswerInput>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar perguntas da página
  const loadQuestions = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await surveyService.getQuestions(assessmentId, page);
      setQuestionsPage(data);
      setCurrentPage(page);

      // Preencher respostas existentes
      const existingAnswers: Record<string, AnswerInput> = {};
      data.questions.forEach((q) => {
        if (q.currentAnswer) {
          existingAnswers[q.id] = {
            questionId: q.id,
            value: q.currentAnswer.value,
            comment: q.currentAnswer.comment || undefined,
          };
        }
      });
      setAnswers(existingAnswers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar perguntas');
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  // Carregar primeira página ao montar
  useEffect(() => {
    loadQuestions(1);
  }, [loadQuestions]);

  // Atualizar resposta
  const updateAnswer = useCallback((questionId: string, value: any, comment?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, value, comment },
    }));
  }, []);

  // Salvar respostas (auto-save)
  const saveAnswers = useCallback(async () => {
    if (Object.keys(answers).length === 0) return;

    setSaving(true);
    setError(null);
    try {
      const answersArray = Object.values(answers);
      const response = await surveyService.submitAnswers(assessmentId, {
        answers: answersArray,
      });

      // Atualizar progresso
      if (questionsPage) {
        setQuestionsPage({
          ...questionsPage,
          progress: response.progress,
        });
      }

      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar respostas');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [assessmentId, answers, questionsPage]);

  // Navegar para próxima página
  const nextPage = useCallback(async () => {
    if (!questionsPage || currentPage >= questionsPage.totalPages) return;

    // Salvar respostas antes de navegar
    await saveAnswers();
    await loadQuestions(currentPage + 1);
  }, [questionsPage, currentPage, saveAnswers, loadQuestions]);

  // Navegar para página anterior
  const previousPage = useCallback(async () => {
    if (currentPage <= 1) return;

    // Salvar respostas antes de navegar
    await saveAnswers();
    await loadQuestions(currentPage - 1);
  }, [currentPage, saveAnswers, loadQuestions]);

  // Completar assessment
  const completeAssessment = useCallback(async () => {
    // Salvar respostas pendentes
    await saveAnswers();

    try {
      const response = await surveyService.completeAssessment(assessmentId);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao completar questionário');
      throw err;
    }
  }, [assessmentId, saveAnswers]);

  return {
    questionsPage,
    currentPage,
    answers,
    loading,
    saving,
    error,
    updateAnswer,
    saveAnswers,
    nextPage,
    previousPage,
    completeAssessment,
    hasNextPage: questionsPage ? currentPage < questionsPage.totalPages : false,
    hasPreviousPage: currentPage > 1,
    isComplete: questionsPage?.progress === 100,
  };
};
