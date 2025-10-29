import { z } from 'zod';

export const paymentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  method: z.string().min(1, 'Payment method is required'),
  txnId: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
