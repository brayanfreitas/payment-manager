import { CpfValidator } from '@/application/validators';
import { PaymentMethod } from '@/domain/enums';
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

export class CreatePaymentDto {
  @ApiProperty({
    description: 'CPF do cliente',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  @Validate(CpfValidator)
  cpf: string;

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
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
