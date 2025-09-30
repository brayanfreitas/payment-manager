import type { Payment } from '@/domain';
import type { PaymentFilters, PaymentRepository } from '@/domain/repositories';
import { Injectable } from '@nestjs/common';
import type { PaymentFiltersDto } from '../dtos';

@Injectable()
export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(filters?: PaymentFiltersDto): Promise<Payment[]> {
    const paymentFilters: PaymentFilters = {};

    if (filters?.cpf) {
      paymentFilters.cpf = filters.cpf;
    }

    if (filters?.paymentMethod) {
      paymentFilters.paymentMethod = filters.paymentMethod;
    }

    return await this.paymentRepository.findAll(paymentFilters);
  }
}
