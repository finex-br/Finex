import { api } from './api';
import type {
  Survey,
  Assessment,
  QuestionsPage,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  CompleteAssessmentResponse,
  CompletedAssessment,
  AssessmentResponse,
} from '../types/survey.types';

export const surveyService = {
  // Listar surveys pendentes
  async getPendingSurveys(): Promise<Survey[]> {
    const response = await api.get('/surveys/pending');
    return response.data.pendingSurveys || [];
  },

  // Iniciar ou retomar assessment
  async startAssessment(surveyId: string): Promise<Assessment> {
    const response = await api.post(`/surveys/${surveyId}/start`);
    return response.data;
  },

  // Buscar perguntas (paginadas)
  async getQuestions(assessmentId: string, page: number): Promise<QuestionsPage> {
    const response = await api.get(`/surveys/assessments/${assessmentId}/questions?page=${page}`);
    return response.data;
  },

  // Enviar respostas
  async submitAnswers(
    assessmentId: string,
    request: SubmitAnswersRequest
  ): Promise<SubmitAnswersResponse> {
    const response = await api.post(`/surveys/assessments/${assessmentId}/answers`, request);
    return response.data;
  },

  // Completar assessment
  async completeAssessment(assessmentId: string): Promise<CompleteAssessmentResponse> {
    const response = await api.post(`/surveys/assessments/${assessmentId}/complete`);
    return response.data;
  },

  // Listar assessments completados
  async getCompletedAssessments(): Promise<CompletedAssessment[]> {
    const response = await api.get('/surveys/completed');
    return response.data.completedAssessments || [];
  },

  // Buscar respostas de um assessment completado
  async getAssessmentResponses(assessmentId: string): Promise<{
    assessmentId: string;
    surveyTitle: string;
    responses: AssessmentResponse[];
  }> {
    const response = await api.get(`/surveys/assessments/${assessmentId}/responses`);
    return response.data;
  },

  // Upload de arquivo (TODO: implementar quando backend estiver pronto)
  async uploadFile(assessmentId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/surveys/assessments/${assessmentId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.fileId;
  },
};
