import type { CreatePaymentDto } from '@/application/dtos';
import type { Payment } from '@/domain';
import { PaymentMethod, PaymentStatus } from '@/domain';
import type { PaymentRepository } from '@/domain/repositories';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { cpf, description, amount, paymentMethod } = createPaymentDto;

    this.validateBusinessRules(createPaymentDto);

    const paymentData = {
      cpf,
      description,
      amount,
      paymentMethod,
      status: PaymentStatus.PENDING,
      mercadoPagoId: undefined,
    };

    if (paymentMethod === PaymentMethod.PIX) {
      return await this.paymentRepository.create(paymentData);
    }

    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
      return await this.paymentRepository.create(paymentData);
    }

    return await this.paymentRepository.create(paymentData);
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
