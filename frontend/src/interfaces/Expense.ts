import { z } from 'zod';

// Validation schema for recording and updating expenses
export const expenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  amount: z.coerce.number().positive('O valor deve ser positivo'),
  dueDate: z.coerce.date(),
  paymentDate: z.coerce.date().optional().nullable(),
  status: z
    .enum(['pending', 'paid', 'cancelled', 'overdue'])
    .default('pending'),
  category: z
    .enum(['utilities', 'equipment', 'rent', 'marketing', 'salary', 'other'])
    .default('other'),
  // Fields for installments and recurrence
  installment: z.number().int().positive().optional().nullable(),
  totalInstallments: z.number().int().positive().optional().nullable(),
  isRecurring: z.boolean().default(false),
  parentId: z.number().optional().nullable(),
  observations: z.string().optional().or(z.literal('')),
});

// Type inferred from the validation schema for form data handling
export type ExpenseBody = z.infer<typeof expenseSchema>;

// Status used specifically for UI logic (e.g., table badges and colors)
export type ExpenseStatus = 'pending' | 'paid' | 'cancelled' | 'overdue';

// Categories for financial reporting and organization
export type ExpenseCategory =
  | 'utilities'
  | 'equipment'
  | 'rent'
  | 'marketing'
  | 'salary'
  | 'other';

// Database expense interface representation
export interface IExpense {
  id?: number;
  description: string;
  amount: number;
  dueDate: Date;
  paymentDate?: Date | null;
  status: ExpenseStatus;
  category: ExpenseCategory;
  installment?: number | null;
  totalInstallments?: number | null;
  isRecurring: boolean;
  parentId?: number | null;
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface for financial statistics specific to expenses.
 */
export interface IExpenseStats {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  count: number;
  expensesPaid: number;
  netBalance: number;
}
