import type { CreatePaymentDto } from '@/application/dtos';
import type { Payment } from '@/domain';
import { PaymentMethod, PaymentStatus } from '@/domain';
import type { PaymentRepository } from '@/domain/repositories';
import { TemporalService } from '@/infrastructure/temporal/temporal.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CreatePaymentUseCase {
  private readonly logger = new Logger(CreatePaymentUseCase.name);

  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    private readonly temporalService: TemporalService,
  ) {}

  async execute(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { paymentMethod } = createPaymentDto;

    this.validateBusinessRules(createPaymentDto);

    if (paymentMethod === PaymentMethod.PIX) {
      return await this.handlePixPayment(createPaymentDto);
    }

    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
      return await this.handleCreditCardPayment(createPaymentDto);
    }

    throw new BadRequestException(
      `Unsupported payment method: ${paymentMethod}`,
    );
  }

  private async handlePixPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    const { cpf, description, amount, paymentMethod } = createPaymentDto;

    const paymentData = {
      cpf,
      description,
      amount,
      paymentMethod,
      status: PaymentStatus.PENDING,
      mercadoPagoId: undefined,
    };

    this.logger.log('Creating PIX payment - simple PENDING record');
    return await this.paymentRepository.create(paymentData);
  }

  private async handleCreditCardPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    const { cpf, description, amount } = createPaymentDto;

    if (!this.temporalService.isAvailable()) {
      throw new BadRequestException(
        'Temporal.io is required for credit card payments but is not available',
      );
    }

    const paymentId = randomUUID();

    try {
      await this.temporalService.startPaymentWorkflow({
        paymentId,
        paymentMethod: 'CREDIT_CARD',
        amount,
        cpf,
        description,
      });

      this.logger.log(`Credit card payment workflow started for ${paymentId}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const payments = await this.paymentRepository.findAll({ cpf });
      const recentPayment = payments
        .filter((p) => p.amount === amount && p.paymentMethod === 'CREDIT_CARD')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      if (!recentPayment) {
        throw new Error('Payment not created by workflow');
      }

      return recentPayment;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Failed to start credit card payment workflow for ${paymentId}`,
        error,
      );
      throw new BadRequestException('Failed to process credit card payment');
    }
  }

  private validateBusinessRules(dto: CreatePaymentDto): void {
    if (dto.paymentMethod === PaymentMethod.PIX) {
      this.validatePixBusinessRules(dto);
    }

    if (dto.paymentMethod === PaymentMethod.CREDIT_CARD) {
      this.validateCreditCardBusinessRules(dto);
    }
  }

  private validatePixBusinessRules(dto: CreatePaymentDto): void {
    if (dto.amount > 20000) {
      throw new BadRequestException('PIX payments cannot exceed R$ 20,000');
    }
  }

  private validateCreditCardBusinessRules(dto: CreatePaymentDto): void {
    // Sem regra por enquanto
  }
}
