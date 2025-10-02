import { UpdatePaymentUseCase } from '@/application/use-cases';
import { PaymentStatus } from '@/domain/enums';
import { MercadoPagoService } from '@/infrastructure/external/mercado-pago.service';
import { TemporalService } from '@/infrastructure/temporal/temporal.service';
import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface MercadoPagoWebhookData {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

@ApiTags('webhook')
@Controller('api/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly temporalService: TemporalService,
  ) {}

  @Post('mercadopago')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook do Mercado Pago' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processado com sucesso',
  })
  async handleMercadoPagoWebhook(
    @Body() webhookData: MercadoPagoWebhookData,
  ): Promise<{ status: string }> {
    try {
      this.logger.log('Received MercadoPago webhook', webhookData);

      if (webhookData.type !== 'payment') {
        this.logger.log('Ignoring non-payment webhook');
        return { status: 'ignored' };
      }

      const paymentInfo = await this.mercadoPagoService.getPaymentInfo(
        webhookData.data.id,
      );

      if (!paymentInfo.external_reference) {
        this.logger.warn('Payment without external_reference');
        return { status: 'no_reference' };
      }

      const status = this.mapMercadoPagoStatus(paymentInfo.status);

      await this.updatePaymentUseCase.execute(paymentInfo.external_reference, {
        status,
        mercadoPagoId: webhookData.data.id,
      });

      if (this.temporalService.isAvailable()) {
        await this.temporalService.updatePaymentStatus(
          paymentInfo.external_reference,
          status,
        );
      }

      this.logger.log(
        `Payment ${paymentInfo.external_reference} updated to ${status}`,
      );

      return { status: 'processed' };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      return { status: 'error' };
    }
  }

  private mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
    switch (mpStatus) {
      case 'approved':
        return PaymentStatus.PAID;
      case 'rejected':
        return PaymentStatus.FAIL;
      case 'cancelled':
        return PaymentStatus.FAIL;
      case 'pending':
      case 'in_process':
      default:
        return PaymentStatus.PENDING;
    }
  }
}
