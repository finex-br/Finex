import { api } from './api';

export interface CreateSurveyRequest {
  title: string;
  description?: string;
}

export interface SurveyResponse {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
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
}

export const adminSurveyService = new AdminSurveyService();
