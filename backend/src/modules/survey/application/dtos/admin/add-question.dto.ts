export interface AddQuestionDTO {
  surveyVersionId: string;
  text: string;
  type: 'DROPDOWN' | 'TEXT' | 'CNPJ' | 'NUMBER' | 'FILE_UPLOAD';
  options?: string[];
  orderIndex: number;
}
