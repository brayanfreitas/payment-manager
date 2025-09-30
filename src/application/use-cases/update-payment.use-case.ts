import { PaymentMethod, type Payment } from '@/domain';
import type { PaymentRepository } from '@/domain/repositories';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdatePaymentDto } from '../dtos';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findById(id);

    if (!existingPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    this.validateBusinessRules(existingPayment, updatePaymentDto);

    return await this.paymentRepository.update(id, updatePaymentDto);
  }

  private validateBusinessRules(
    existingPayment: Payment,
    dto: UpdatePaymentDto,
  ): void {
    if (
      dto.paymentMethod &&
      dto.paymentMethod !== existingPayment.paymentMethod
    ) {
      throw new BadRequestException('Cannot change payment method');
    }

    if (dto.amount && existingPayment.paymentMethod === PaymentMethod.PIX) {
      if (dto.amount > 20000) {
        throw new BadRequestException('PIX payments cannot exceed R$ 20,000');
      }
    }
  }
}
