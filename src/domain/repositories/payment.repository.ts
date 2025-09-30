import { Payment } from '../entities';
import { PaymentMethod } from '../enums';

export interface PaymentFilters {
  cpf?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentRepository {
  create(
    payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(filters?: PaymentFilters): Promise<Payment[]>;
  update(id: string, payment: Partial<Payment>): Promise<Payment>;
  delete(id: string): Promise<void>;
}
