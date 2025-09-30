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
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Validate(CpfValidator)
  cpf?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
