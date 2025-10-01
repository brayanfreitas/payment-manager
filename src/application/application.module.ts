import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import {
  CreatePaymentUseCase,
  GetPaymentUseCase,
  ListPaymentsUseCase,
  UpdatePaymentUseCase,
} from './use-cases';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreatePaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
    UpdatePaymentUseCase,
  ],
  exports: [
    CreatePaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
    UpdatePaymentUseCase,
  ],
})
export class ApplicationModule {}
