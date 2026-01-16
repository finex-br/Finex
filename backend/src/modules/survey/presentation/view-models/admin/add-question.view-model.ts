import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsArray, IsInt, Min, IsOptional, ValidateIf } from 'class-validator';

export class AddQuestionViewModel {
  @ApiProperty({ 
    example: 'Qual o setor da sua empresa?', 
    description: 'Question text' 
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ 
    enum: ['DROPDOWN', 'TEXT', 'CNPJ', 'NUMBER', 'FILE_UPLOAD'],
    example: 'DROPDOWN',
    description: 'Question type' 
  })
  @IsEnum(['DROPDOWN', 'TEXT', 'CNPJ', 'NUMBER', 'FILE_UPLOAD'])
  type: 'DROPDOWN' | 'TEXT' | 'CNPJ' | 'NUMBER' | 'FILE_UPLOAD';

  @ApiProperty({ 
    example: ['Tecnologia', 'Saúde', 'Educação', 'Varejo'],
    description: 'Options for DROPDOWN questions',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ValidateIf((o) => o.type === 'DROPDOWN')
  options?: string[];

  @ApiProperty({ 
    example: 1,
    description: 'Order index of the question (0-based)' 
  })
  @IsInt()
  @Min(0)
  orderIndex: number;
}
