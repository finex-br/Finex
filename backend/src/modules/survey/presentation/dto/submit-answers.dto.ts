import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  value: any;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class SubmitAnswersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
