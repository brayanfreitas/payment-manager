import { ApplicationModule } from '@/application/application.module';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { PaymentController, WebhookController } from './controllers';

@Module({
  imports: [ApplicationModule, InfrastructureModule],
  controllers: [PaymentController, WebhookController],
})
export class PresentationModule {}
