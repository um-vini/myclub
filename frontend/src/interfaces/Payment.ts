import { z } from 'zod';
import type { IMember } from './Member';

// Validation schema for recording and updating payments
export const paymentSchema = z.object({
  memberId: z.number().positive('ID do aluno inválido'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2025),
  amountPaid: z.coerce.number().positive('O valor deve ser positivo'),
  paymentDate: z.coerce.date().default(() => new Date()),
  dueDate: z.coerce.date().optional(),
  status: z.enum(['paid', 'refunded', 'cancelled']),
  paymentMethod: z.enum(['pix', 'cash', 'credit_card', 'debit_card']),
  category: z.enum(['membership', 'product', 'other']).default('membership'),
  description: z.string().optional().default('Mensalidade'),
});

// Type inferred from the validation schema for form data
export type PaymentBody = z.infer<typeof paymentSchema>;

// Status used specifically for UI logic (e.g., table badges)
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

// Possible database states for a payment record
export type PaymentStatusState = 'paid' | 'refunded' | 'cancelled';

// Available payment methods in the system
export type PaymentMethod = 'pix' | 'cash' | 'credit_card' | 'debit_card';

// Payment categorization for financial reporting
export type PaymentCategory = 'membership' | 'product' | 'other';

// Database payment interface representation
export interface IPayment {
  id?: number;
  memberId: number;
  month: number; // Reference month (1 - 12)
  year: number; // Reference year (20xx)
  amountPaid: number;
  paymentDate: Date;
  dueDate: Date;
  status: PaymentStatusState;
  paymentMethod: PaymentMethod;
  category: PaymentCategory;
  description: string;
  member?: IMember | null;
}
