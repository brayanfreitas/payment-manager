import { Module } from '@nestjs/common';
import { ApplicationModule } from '@/application/application.module';
import { PaymentController } from './controllers';

@Module({
  imports: [ApplicationModule],
  controllers: [PaymentController],
})
export class PresentationModule {}
