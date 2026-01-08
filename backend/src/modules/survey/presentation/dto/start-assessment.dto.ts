import { IsString, IsNotEmpty } from 'class-validator';

export class StartAssessmentDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;
}
