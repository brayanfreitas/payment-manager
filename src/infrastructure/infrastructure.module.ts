import { Module } from '@nestjs/common';
import { PaymentRepositoryImpl, PrismaService } from './database';
import { MercadoPagoService } from './external/mercado-pago.service';
import { TemporalService } from './temporal/temporal.service';

@Module({
  providers: [
    PrismaService,
    MercadoPagoService,
    TemporalService,
    {
      provide: 'PaymentRepository',
      useClass: PaymentRepositoryImpl,
    },
  ],
  exports: [
    'PaymentRepository',
    PrismaService,
    MercadoPagoService,
    TemporalService,
  ],
})
export class InfrastructureModule {}
