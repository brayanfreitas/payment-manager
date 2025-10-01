import { PaymentMethod, PaymentStatus } from '@/domain/enums';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'ID único do pagamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'CPF do cliente',
    example: '12345678901',
  })
  cpf: string;

  @ApiProperty({
    description: 'Descrição da cobrança',
    example: 'Compra online',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 100.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Status do pagamento',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'ID do Mercado Pago (quando aplicável)',
    example: 'mp_123456789',
    required: false,
  })
  mercadoPagoId?: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2023-10-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de última atualização',
    example: '2023-10-01T10:00:00.000Z',
  })
  updatedAt: Date;
}
