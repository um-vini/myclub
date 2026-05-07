import { z } from 'zod';

// Validation schema for recording and updating expenses (accounts payable)
export const expenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  amount: z.coerce.number().positive('O valor deve ser positivo'),
  dueDate: z.coerce.date('A data de vencimento é obrigatória'),
  paymentDate: z.coerce.date().optional().nullable(),
  status: z
    .enum(['pending', 'paid', 'cancelled', 'overdue'])
    .default('pending'),
  category: z
    .enum(['utilities', 'equipment', 'rent', 'marketing', 'salary', 'other'])
    .default('other'),
  // Fields for installments and recurrence
  installment: z.coerce
    .number()
    .int('A parcela deve ser um número inteiro')
    .positive('A parcela deve ser um número maior que zero')
    .optional()
    .nullable(),

  totalInstallments: z.coerce
    .number()
    .int('O total deve ser um número inteiro')
    .positive('O total deve ser um número maior que zero')
    .optional()
    .nullable(),
  isRecurring: z.boolean().default(false),
  parentId: z.number().optional().nullable(),
  observations: z.string().optional().or(z.literal('')),
});

// Type inferred from the validation schema for form data handling
export type ExpenseBody = z.infer<typeof expenseSchema>;

// Possible database states for an expense record
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
}

// Interface for financial balance statistics (Cash Flow)
export interface IFinancialBalance {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export interface IExpenseStats {
  expectedExpense: string | number;
  expensesPaid: string | number;
}
