import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateSurveyViewModel {
  @ApiProperty({ example: 'Questionário de Maturidade ESG', description: 'Survey title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ 
    example: 'Avaliação completa de práticas ESG da empresa', 
    description: 'Survey description',
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;
}
