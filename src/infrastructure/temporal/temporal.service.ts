import type { PaymentRepository } from '@/domain/repositories';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@temporalio/client';
import { NativeConnection, Worker } from '@temporalio/worker';
import { MercadoPagoService } from '../external/mercado-pago.service';
import { PaymentActivitiesImpl } from './activities/payment.activities';
import type { PaymentWorkflowInput } from './workflows/payment.workflow';
import {
  cancelPaymentSignal,
  paymentStatusUpdateSignal,
} from './workflows/payment.workflow';

@Injectable()
export class TemporalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TemporalService.name);
  private client: Client | null = null;
  private worker: Worker | null = null;
  private connection: NativeConnection | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async onModuleInit() {
    try {
      await this.initializeClient();
      await this.initializeWorker();
      this.logger.log('Temporal service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Temporal service', error);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.worker) {
        await this.worker.shutdown();
        this.logger.log('Temporal worker shutdown');
      }
      if (this.connection) {
        await this.connection.close();
        this.logger.log('Temporal connection closed');
      }
    } catch (error) {
      this.logger.error('Error during Temporal shutdown', error);
    }
  }

  private async initializeClient() {
    const temporalAddress = this.configService.get<string>(
      'TEMPORAL_ADDRESS',
      'localhost:7233',
    );

    this.connection = await NativeConnection.connect({
      address: temporalAddress,
    });

    this.client = new Client({
      connection: this.connection,
      namespace: this.configService.get<string>(
        'TEMPORAL_NAMESPACE',
        'default',
      ),
    });

    this.logger.log(`Connected to Temporal at ${temporalAddress}`);
  }

  private async initializeWorker() {
    if (!this.connection) {
      throw new Error('Temporal connection not initialized');
    }

    const activities = new PaymentActivitiesImpl(
      this.paymentRepository,
      this.mercadoPagoService,
    );

    this.worker = await Worker.create({
      connection: this.connection,
      namespace: this.configService.get<string>(
        'TEMPORAL_NAMESPACE',
        'default',
      ),
      taskQueue: 'payment-queue',
      workflowsPath: require.resolve('./workflows'),
      activities,
    });

    this.worker.run().catch((error) => {
      this.logger.error('Temporal worker error', error);
    });

    this.logger.log('Temporal worker started');
  }

  async startPaymentWorkflow(input: PaymentWorkflowInput): Promise<string> {
    if (!this.client) {
      throw new Error('Temporal client not initialized');
    }

    try {
      const workflowId = `payment-${input.paymentId}`;

      const handle = await this.client.workflow.start('paymentWorkflow', {
        args: [input],
        taskQueue: 'payment-queue',
        workflowId,
        workflowExecutionTimeout: '1h',
      });

      this.logger.log(`Payment workflow started`, {
        workflowId,
        paymentId: input.paymentId,
      });

      return handle.workflowId;
    } catch (error) {
      this.logger.error('Failed to start payment workflow', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        'Temporal client not available, skipping workflow signal',
      );
      return;
    }

    try {
      const workflowId = `payment-${paymentId}`;

      const handle = this.client.workflow.getHandle(workflowId);
      await handle.signal(paymentStatusUpdateSignal, paymentId, status);

      this.logger.log(`Payment status signal sent`, { paymentId, status });
    } catch (error) {
      this.logger.error('Failed to send payment status signal', error);
    }
  }

  async cancelPayment(paymentId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Temporal client not initialized');
    }

    try {
      const workflowId = `payment-${paymentId}`;

      const handle = this.client.workflow.getHandle(workflowId);
      await handle.signal(cancelPaymentSignal);

      this.logger.log(`Payment cancellation signal sent`, { paymentId });
    } catch (error) {
      this.logger.error('Failed to cancel payment workflow', error);
      throw error;
    }
  }

  async getPaymentWorkflowStatus(paymentId: string): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      const workflowId = `payment-${paymentId}`;

      const handle = this.client.workflow.getHandle(workflowId);
      const status = (await handle.query('getPaymentStatus')) as string;

      return status;
    } catch (error) {
      this.logger.error('Failed to query payment workflow status', error);
      return null;
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.worker !== null;
  }
}
