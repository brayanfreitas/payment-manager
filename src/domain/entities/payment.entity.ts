import { PaymentMethod, PaymentStatus } from '../enums';

export interface Payment {
  id: string;
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  mercadoPagoId?: string;
  createdAt: Date;
  updatedAt: Date;
}
