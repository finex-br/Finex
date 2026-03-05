import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty({ example: 'Diagnóstico 360', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Questionário completo de diagnóstico empresarial', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 5, required: false, description: 'Tempo estimado em minutos' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  estimatedTimeMinutes?: number;
}
