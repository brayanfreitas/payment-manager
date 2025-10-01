import { Module } from '@nestjs/common';
import { PaymentRepositoryImpl, PrismaService } from './database';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'PaymentRepository',
      useClass: PaymentRepositoryImpl,
    },
  ],
  exports: ['PaymentRepository', PrismaService],
})
export class InfrastructureModule {}
