export interface QuestionResponseDTO {
  id: string;
  surveyVersionId: string;
  text: string;
  type: string;
  options?: string[];
  orderIndex: number;
  createdAt: Date;
}
