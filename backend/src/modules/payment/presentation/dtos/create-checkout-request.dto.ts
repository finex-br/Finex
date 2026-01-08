import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutRequestDto {
  @ApiProperty({
    description: 'Amount in BRL (Brazilian Real)',
    example: 99.99,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be at least R$ 1.00' })
  amount: number;

  @ApiProperty({
    description: 'Description of the payment',
    example: 'Premium Plan - Monthly Subscription',
    maxLength: 500,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Maximum number of installments allowed (1-12)',
    example: 12,
    required: false,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Installments must be at least 1' })
  @Max(12, { message: 'Installments cannot exceed 12' })
  maxInstallments?: number;

  @ApiProperty({
    description: 'Customer name',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'joao@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({
    description: 'Customer CPF or CNPJ',
    example: '12345678901',
    required: false,
  })
  @IsOptional()
  @IsString()
  customerCpfCnpj?: string;
}
