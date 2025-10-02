import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../../domain/enums';
import { CpfValidator } from '../validators';

export class UpdatePaymentDto {
  @ApiProperty({
    description: 'CPF do cliente',
    example: '12345678901',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Validate(CpfValidator)
  cpf?: string;

  @ApiProperty({
    description: 'Descrição da cobrança',
    example: 'Compra online',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 100.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Status do pagamento',
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'ID do Mercado Pago',
    example: 'MP-123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  mercadoPagoId?: string;
}
