import type { PaymentRepository } from '@/domain/repositories';
import { MercadoPagoService } from '@/infrastructure/external/mercado-pago.service';
import type { PaymentWorkflowInput } from '@/infrastructure/temporal/workflows/payment.workflow';
import { Inject } from '@nestjs/common';
import { Context } from '@temporalio/activity';

export interface PaymentActivities {
  createPaymentRecord(input: PaymentWorkflowInput): Promise<string>; // Retorna o ID criado
  createMercadoPagoPreference(paymentId: string): Promise<void>;
  updatePaymentStatus(paymentId: string, status: string): Promise<void>;
  getPaymentStatus(paymentId: string): Promise<string>;
  sendNotification(paymentId: string, status: string): Promise<void>;
}

export class PaymentActivitiesImpl implements PaymentActivities {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    @Inject('MercadoPagoService')
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async createPaymentRecord(input: PaymentWorkflowInput): Promise<string> {
    const context = Context.current();
    context.log.info('Creating payment record', { paymentId: input.paymentId });

    try {
      const paymentData = {
        cpf: input.cpf,
        description: input.description,
        amount: input.amount,
        paymentMethod: input.paymentMethod as any,
        status: 'PENDING' as any,
        mercadoPagoId: undefined,
      };

      const createdPayment = await this.paymentRepository.create(paymentData);

      context.log.info('Payment record created successfully', {
        paymentId: createdPayment.id,
      });

      return createdPayment.id;
    } catch (error) {
      console.log('Failed to create payment record', {
        paymentId: input.paymentId,
        error,
      });
      context.log.error('Failed to create payment record', {
        paymentId: input.paymentId,
        error,
      });
      throw error;
    }
  }

  async createMercadoPagoPreference(paymentId: string): Promise<void> {
    const context = Context.current();
    context.log.info('Creating MercadoPago preference', { paymentId });

    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment ${paymentId} not found`);
      }

      const preference =
        await this.mercadoPagoService.createPreference(payment);

      await this.paymentRepository.update(paymentId, {
        mercadoPagoId: preference.id,
      });

      context.log.info('MercadoPago preference created', {
        paymentId,
        preferenceId: preference.id,
      });
    } catch (error) {
      context.log.error('Failed to create MercadoPago preference', {
        paymentId,
        error,
      });
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    const context = Context.current();
    context.log.info('Updating payment status', { paymentId, status });

    try {
      await this.paymentRepository.update(paymentId, { status: status as any });

      context.log.info('Payment status updated', { paymentId, status });
    } catch (error) {
      context.log.error('Failed to update payment status', {
        paymentId,
        status,
        error,
      });
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    const context = Context.current();
    context.log.info('Getting payment status', { paymentId });

    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment ${paymentId} not found`);
      }

      context.log.info('Payment status retrieved', {
        paymentId,
        status: payment.status,
      });

      return payment.status;
    } catch (error) {
      context.log.error('Failed to get payment status', { paymentId, error });
      throw error;
    }
  }

  async sendNotification(paymentId: string, status: string): Promise<void> {
    const context = Context.current();
    context.log.info('Sending notification', { paymentId, status });

    try {
      context.log.info('Notification sent', { paymentId, status });
    } catch (error) {
      context.log.warn('Failed to send notification', {
        paymentId,
        status,
        error,
      });
    }
  }
}
