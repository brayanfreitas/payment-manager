import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Validate } from 'class-validator';
import { PaymentMethod } from '../../domain/enums';
import { CpfValidator } from '../validators';

export class PaymentFiltersDto {
  @ApiProperty({
    description: 'Filtrar por CPF do cliente',
    example: '12345678901',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Validate(CpfValidator)
  cpf?: string;

  @ApiProperty({
    description: 'Filtrar por método de pagamento',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
