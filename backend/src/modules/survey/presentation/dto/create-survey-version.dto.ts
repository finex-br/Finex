import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsNumber()
  orderIndex: number;
}

export class CreateSurveyVersionDto {
  @IsString()
  @IsNotEmpty()
  surveyId: string;

  @IsOptional()
  effectiveDate?: Date;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
