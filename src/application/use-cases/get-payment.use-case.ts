import type { Payment } from '@/domain';
import type { PaymentRepository } from '@/domain/repositories';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetPaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }
}
