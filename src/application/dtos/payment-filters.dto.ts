import { IsEnum, IsOptional, IsString, Validate } from 'class-validator';
import { PaymentMethod } from '../../domain/enums';
import { CpfValidator } from '../validators';

export class PaymentFiltersDto {
  @IsOptional()
  @IsString()
  @Validate(CpfValidator)
  cpf?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
