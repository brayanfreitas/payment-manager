import {
  condition,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
} from '@temporalio/workflow';
import type { PaymentActivities } from '../activities/payment.activities';

export const paymentStatusUpdateSignal = defineSignal<[string, string]>(
  'paymentStatusUpdate',
);
export const cancelPaymentSignal = defineSignal('cancelPayment');

export const getPaymentStatusQuery = defineQuery<string>('getPaymentStatus');

const activities = proxyActivities<PaymentActivities>({
  startToCloseTimeout: '30s',
  retry: {
    initialInterval: '1s',
    maximumInterval: '30s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export interface PaymentWorkflowInput {
  paymentId: string;
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  amount: number;
  cpf: string;
  description?: string;
}

export async function paymentWorkflow(
  input: PaymentWorkflowInput,
): Promise<string> {
  let paymentStatus = 'PENDING';
  let cancelled = false;

  console.log('Payment workflow started');

  setHandler(paymentStatusUpdateSignal, (paymentId: string, status: string) => {
    if (paymentId === input.paymentId) {
      paymentStatus = status;
    }
  });

  setHandler(cancelPaymentSignal, () => {
    cancelled = true;
  });

  setHandler(getPaymentStatusQuery, () => paymentStatus);

  if (input.paymentMethod !== 'CREDIT_CARD') {
    throw new Error('Workflow is only for CREDIT_CARD payments');
  }
  console.log('CHEGOU AQUI');
  try {
    const createdPaymentId = await activities.createPaymentRecord(input);

    await activities.createMercadoPagoPreference(createdPaymentId);

    const paymentConfirmed = await condition(
      () => paymentStatus === 'PAID' || paymentStatus === 'FAIL' || cancelled,
      '15m',
    );

    if (cancelled) {
      await activities.updatePaymentStatus(createdPaymentId, 'FAIL');
      return 'CANCELLED';
    }

    if (!paymentConfirmed) {
      await activities.updatePaymentStatus(createdPaymentId, 'FAIL');
      return 'EXPIRED';
    }
    return paymentStatus;
  } catch (error) {
    const paymentIdToUpdate = input.paymentId;
    await activities.updatePaymentStatus(paymentIdToUpdate, 'FAIL');
    throw error;
  }
}
