export interface Survey {
  surveyId: string;
  title: string;
  description: string;
  hasStarted: boolean;
  progress?: number;
  assessmentId?: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  orderIndex: number;
  currentAnswer?: CurrentAnswer;
}

export interface CurrentAnswer {
  value: any;
  comment: string | null;
}

export type QuestionType = 'DROPDOWN' | 'TEXT' | 'CNPJ' | 'NUMBER' | 'FILE_UPLOAD';

export interface Assessment {
  assessmentId: string;
  surveyTitle: string;
  totalQuestions: number;
  currentProgress: number;
  isResuming: boolean;
}

export interface QuestionsPage {
  assessmentId: string;
  page: number;
  totalPages: number;
  progress: number;
  questions: Question[];
}

export interface AnswerInput {
  questionId: string;
  value: any;
  comment?: string;
}

export interface SubmitAnswersRequest {
  answers: AnswerInput[];
}

export interface SubmitAnswersResponse {
  success: boolean;
  progress: number;
  isCompleted: boolean;
}

export interface CompleteAssessmentResponse {
  success: boolean;
  finalScore: number;
  completedAt: Date;
}
