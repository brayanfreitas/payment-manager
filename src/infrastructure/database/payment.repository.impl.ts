import type { Payment } from '@/domain';
import { PaymentMethod, PaymentStatus } from '@/domain';
import type { PaymentFilters, PaymentRepository } from '@/domain/repositories';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Payment> {
    const createdPayment = await this.prisma.payment.create({
      data: {
        cpf: payment.cpf,
        description: payment.description || null,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        mercadoPagoId: payment.mercadoPagoId || null,
      },
    });

    return this.mapToDomain(createdPayment);
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    return payment ? this.mapToDomain(payment) : null;
  }

  async findAll(filters?: PaymentFilters): Promise<Payment[]> {
    const where: any = {};

    if (filters?.cpf) {
      where.cpf = filters.cpf;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) => this.mapToDomain(payment));
  }

  async update(id: string, paymentData: Partial<Payment>): Promise<Payment> {
    const updateData: any = {};

    if (paymentData.cpf !== undefined) updateData.cpf = paymentData.cpf;
    if (paymentData.description !== undefined)
      updateData.description = paymentData.description || null;
    if (paymentData.amount !== undefined)
      updateData.amount = paymentData.amount;
    if (paymentData.paymentMethod !== undefined)
      updateData.paymentMethod = paymentData.paymentMethod;
    if (paymentData.status !== undefined)
      updateData.status = paymentData.status;
    if (paymentData.mercadoPagoId !== undefined)
      updateData.mercadoPagoId = paymentData.mercadoPagoId || null;

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: updateData,
    });

    return this.mapToDomain(updatedPayment);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }

  private mapToDomain(prismaPayment: any): Payment {
    return {
      id: prismaPayment.id,
      cpf: prismaPayment.cpf,
      description: prismaPayment.description,
      amount: prismaPayment.amount,
      paymentMethod: prismaPayment.paymentMethod as PaymentMethod,
      status: prismaPayment.status as PaymentStatus,
      mercadoPagoId: prismaPayment.mercadoPagoId,
      createdAt: prismaPayment.createdAt,
      updatedAt: prismaPayment.updatedAt,
    };
  }
}
