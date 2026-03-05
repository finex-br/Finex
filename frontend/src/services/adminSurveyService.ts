import { api } from './api';

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  estimatedTimeMinutes?: number;
}

export interface SurveyResponse {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  estimatedTimeMinutes: number;
  versionId: string;
  versionNumber: number;
  createdAt: string;
}

export interface AddQuestionRequest {
  text: string;
  type: 'DROPDOWN' | 'TEXT' | 'CNPJ' | 'NUMBER' | 'FILE_UPLOAD';
  options?: string[];
  orderIndex: number;
}

export interface QuestionResponse {
  id: string;
  surveyVersionId: string;
  text: string;
  type: string;
  options?: string[];
  orderIndex: number;
  createdAt: string;
}

export interface GetAllSurveysResponse {
  surveys: Array<{
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    estimatedTimeMinutes: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface CompletedAssessment {
  id: string;
  companyId: string;
  companyName: string;
  surveyId: string;
  surveyTitle: string;
  progress: number;
  completedAt: string;
  status: string;
}

export interface GetCompletedAssessmentsResponse {
  assessments: CompletedAssessment[];
}

class AdminSurveyService {
  /**
   * Create a new survey
   */
  async createSurvey(data: CreateSurveyRequest): Promise<SurveyResponse> {
    const response = await api.post<SurveyResponse>(
      '/admin/surveys',
      data
    );
    return response.data;
  }

  /**
   * Add a question to a survey version
   */
  async addQuestion(
    surveyVersionId: string,
    data: AddQuestionRequest
  ): Promise<QuestionResponse> {
    const response = await api.post<QuestionResponse>(
      `/admin/surveys/versions/${surveyVersionId}/questions`,
      data
    );
    return response.data;
  }

  /**
   * Get all surveys
   */
  async getAllSurveys(): Promise<GetAllSurveysResponse> {
    const response = await api.get<GetAllSurveysResponse>('/admin/surveys');
    return response.data;
  }

  /**
   * Get completed assessments with filters
   */
  async getCompletedAssessments(filters?: {
    companyId?: string;
    surveyId?: string;
  }): Promise<GetCompletedAssessmentsResponse> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.surveyId) params.append('surveyId', filters.surveyId);

    const response = await api.get<GetCompletedAssessmentsResponse>(
      `/admin/surveys/assessments/completed?${params.toString()}`
    );
    return response.data;
  }
}

export const adminSurveyService = new AdminSurveyService();
