import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckoutRepository } from '../infrastructure/persistence/typeorm/checkout.repository';
import { CheckoutStatus } from '../domain/value-objects/checkout-status';

@ApiTags('webhooks')
@Controller('webhooks/asaas')
export class AsaasWebhookController {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
  ) {}

  @Post('payment')
  @ApiOperation({ summary: 'Receive Asaas payment notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  async handlePaymentWebhook(
    @Body() payload: any,
    @Headers('asaas-signature') signature: string,
  ) {
    // TODO: Validate webhook signature for security
    // const isValid = this.validateSignature(payload, signature);
    // if (!isValid) {
    //   throw new BadRequestException('Invalid webhook signature');
    // }

    const event = payload.event;
    const paymentData = payload.payment;

    if (!paymentData || !paymentData.id) {
      throw new BadRequestException('Invalid payment data');
    }

    // Find checkout by Asaas payment ID
    const checkout = await this.checkoutRepository.findByAsaasCheckoutId(paymentData.id);

    if (!checkout) {
      // Not an error - might be a payment not managed by our system
      return { received: true, message: 'Payment not found in system' };
    }

    // Update checkout status based on webhook event
    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        const confirmResult = checkout.confirm(paymentData.id);
        if (confirmResult.isFailure) {
          // If already confirmed, try to mark as received
          const receiveResult = checkout.markAsReceived();
          if (receiveResult.isFailure) {
            console.error('Failed to update checkout:', receiveResult.error);
          }
        }
        break;

      case 'PAYMENT_OVERDUE':
        // Checkout entity doesn't have direct overdue handling
        // This would be handled by a scheduled job or separate use case
        console.log(`Payment ${paymentData.id} is overdue`);
        break;

      case 'PAYMENT_REFUNDED':
        // Refund handling would require a separate use case
        console.log(`Payment ${paymentData.id} was refunded`);
        break;

      case 'PAYMENT_DELETED':
        const cancelResult = checkout.cancel();
        if (cancelResult.isFailure) {
          console.error('Failed to cancel checkout:', cancelResult.error);
        }
        break;

      default:
        // Unknown event type - log but don't fail
        console.log(`Unknown Asaas webhook event: ${event}`);
    }

    // Save updated checkout
    await this.checkoutRepository.save(checkout);

    return {
      received: true,
      checkoutId: checkout.id.toString(),
      status: checkout.status.value,
    };
  }

  // TODO: Implement signature validation
  // private validateSignature(payload: any, signature: string): boolean {
  //   const secret = this.configService.get('ASAAS_WEBHOOK_SECRET');
  //   const hash = crypto.createHmac('sha256', secret)
  //     .update(JSON.stringify(payload))
  //     .digest('hex');
  //   return hash === signature;
  // }
}
