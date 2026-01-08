import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCheckoutUseCase } from '../application/use-cases/create-checkout.use-case';
import { CreateCheckoutRequestDto } from './dtos/create-checkout-request.dto';
import { CheckoutResponseDTO } from '../application/dtos/checkout-response.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly createCheckoutUseCase: CreateCheckoutUseCase,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create a new checkout session for credit card payment' })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout created successfully',
    type: CheckoutResponseDTO 
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCheckout(
    @Body() dto: CreateCheckoutRequestDto,
    @Req() req: any,
  ): Promise<CheckoutResponseDTO> {
    const userId = req.user?.id || 'temp-user-id'; // TODO: Get from auth guard

    const result = await this.createCheckoutUseCase.execute({
      userId,
      amount: dto.amount,
      description: dto.description,
      customerName: dto.customerName || 'Customer',
      customerEmail: dto.customerEmail || 'customer@example.com',
      customerCpfCnpj: dto.customerCpfCnpj || '00000000000',
      maxInstallments: dto.maxInstallments,
    });

    if (result.isFailure) {
      throw new Error(result.error || 'Failed to create checkout');
    }

    return result.getValue();
  }

  @Get('checkout/:id')
  @ApiOperation({ summary: 'Get checkout details by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkout found',
    type: CheckoutResponseDTO 
  })
  @ApiResponse({ status: 404, description: 'Checkout not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCheckout(@Param('id') id: string): Promise<CheckoutResponseDTO> {
    // TODO: Implement GetCheckoutUseCase
    throw new Error('Not implemented yet');
  }
}
