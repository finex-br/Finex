export interface SurveyResponseDTO {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  versionId: string;
  versionNumber: number;
  createdAt: Date;
}
