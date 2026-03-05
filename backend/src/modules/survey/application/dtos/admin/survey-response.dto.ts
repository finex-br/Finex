export interface SurveyResponseDTO {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  estimatedTimeMinutes: number;
  versionId: string;
  versionNumber: number;
  createdAt: Date;
}
