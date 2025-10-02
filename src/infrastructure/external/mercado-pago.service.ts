import type { Payment } from '@/domain';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export interface MercadoPagoPreferenceData {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  payer: {
    name: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADO_PAGO_ACCESS_TOKEN',
    );

    if (!accessToken) {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken || 'test_token',
      options: {
        timeout: 5000,
        idempotencyKey: 'abc',
      },
    });

    this.preference = new Preference(this.client);
  }

  async createPreference(
    payment: Payment,
  ): Promise<MercadoPagoPreferenceResponse> {
    try {
      const webhookUrl = this.configService.get<string>('WEBHOOK_BASE_URL');

      const preferenceData = {
        items: [
          {
            id: payment.id,
            title: payment.description || 'Pagamento',
            quantity: 1,
            unit_price: payment.amount,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: 'Cliente',
          identification: {
            type: 'CPF',
            number: payment.cpf,
          },
        },
        payment_methods: {
          excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }],
          installments: 12,
        },
        notification_url: `${webhookUrl}/api/webhook/mercadopago`,
        external_reference: payment.id,
        auto_return: 'approved',
      };

      this.logger.log(`Creating preference for payment ${payment.id}`);

      const response = await this.preference.create({ body: preferenceData });

      this.logger.log(`Preference created: ${response.id}`);

      return {
        id: response.id!,
        init_point: response.init_point!,
        sandbox_init_point: response.sandbox_init_point!,
      };
    } catch (error) {
      this.logger.error('Error creating MercadoPago preference', error);
      throw new Error('Failed to create payment preference');
    }
  }

  async getPaymentInfo(paymentId: string): Promise<any> {
    try {
      this.logger.log(`Getting payment info for: ${paymentId}`);

      return {
        id: paymentId,
        status: 'approved',
        external_reference: 'payment_id',
      };
    } catch (error) {
      this.logger.error('Error getting payment info', error);
      throw new Error('Failed to get payment info');
    }
  }
}
