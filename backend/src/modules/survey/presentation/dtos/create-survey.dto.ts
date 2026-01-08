import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty({ example: 'Diagnóstico 360', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Questionário completo de diagnóstico empresarial' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
