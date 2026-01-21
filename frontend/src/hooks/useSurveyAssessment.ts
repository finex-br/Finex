import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPendingSave = useRef(false);

  // Carregar perguntas da página
  const loadQuestions = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await surveyService.getQuestions(assessmentId, page);
      setQuestionsPage(data);
      setCurrentPage(page);

      // Limpar IDs salvos localmente (nova página = nova sincronização)
      setSavedQuestionIds(new Set());
      
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

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Salvar respostas
  const saveAnswers = useCallback(async (silent = false) => {
    if (Object.keys(answers).length === 0) return;

    setSaving(true);
    if (!silent) setError(null);
    
    try {
      const answersArray = Object.values(answers);
      const response = await surveyService.submitAnswers(assessmentId, {
        answers: answersArray,
      });

      // Marcar questões como salvas localmente (feedback visual imediato)
      setSavedQuestionIds((prev) => {
        const newSet = new Set(prev);
        answersArray.forEach((ans) => newSet.add(ans.questionId));
        return newSet;
      });

      // Atualizar apenas o progresso (sem reload)
      if (questionsPage) {
        setQuestionsPage({
          ...questionsPage,
          progress: response.progress,
        });
      }

      return response;
    } catch (err: any) {
      if (!silent) {
        setError(err.response?.data?.error || 'Erro ao salvar respostas');
      }
      throw err;
    } finally {
      setSaving(false);
    }
  }, [assessmentId, answers, questionsPage]);

  // Trigger para auto-save
  const triggerAutoSave = useCallback(async () => {
    if (Object.keys(answers).length > 0) {
      try {
        await saveAnswers(true); // silent save
      } catch (err) {
        console.error('Erro no auto-save:', err);
      }
    }
  }, [answers, saveAnswers]);

  // Atualizar resposta
  const updateAnswer = useCallback((questionId: string, value: any, comment?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, value, comment },
    }));
    
    // Marcar que há save pendente
    hasPendingSave.current = true;
    
    // Auto-save após 1.5s de inatividade (não interfere na digitação)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      hasPendingSave.current = false;
      // Trigger save via effect
      triggerAutoSave();
    }, 1500);
  }, [triggerAutoSave]);

  // Navegar para próxima página
  const nextPage = useCallback(async () => {
    if (!questionsPage || currentPage >= questionsPage.totalPages) return;

    // Cancelar timeout pendente e salvar imediatamente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Salvar respostas antes de navegar
    if (Object.keys(answers).length > 0) {
      await saveAnswers();
    }
    
    await loadQuestions(currentPage + 1);
  }, [questionsPage, currentPage, answers, saveAnswers, loadQuestions]);

  // Navegar para página anterior
  const previousPage = useCallback(async () => {
    if (currentPage <= 1) return;

    // Cancelar timeout pendente e salvar imediatamente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Salvar respostas antes de navegar
    if (Object.keys(answers).length > 0) {
      await saveAnswers();
    }
    
    await loadQuestions(currentPage - 1);
  }, [currentPage, answers, saveAnswers, loadQuestions]);

  // Completar assessment
  const completeAssessment = useCallback(async () => {
    // Cancelar timeout pendente e salvar imediatamente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Salvar respostas pendentes
    if (Object.keys(answers).length > 0) {
      await saveAnswers();
    }

    try {
      const response = await surveyService.completeAssessment(assessmentId);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao completar questionário');
      throw err;
    }
  }, [assessmentId, answers, saveAnswers]);

  return {
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
    hasNextPage: questionsPage ? currentPage < questionsPage.totalPages : false,
    hasPreviousPage: currentPage > 1,
    isComplete: questionsPage?.progress === 100,
  };
};
