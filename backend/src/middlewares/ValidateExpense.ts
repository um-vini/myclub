import type { Request, Response, NextFunction } from 'express';
import { expenseSchema, type ExpenseBody } from '../interfaces/Expense.js';

/**
 * Middleware to validate expense data using Zod schema.
 * Ensures all financial outflows follow the required structure.
 */
const validateExpense = (req: Request, res: Response, next: NextFunction) => {
  // Use safeParse to prevent the application from throwing errors during validation
  const result = expenseSchema.safeParse(req.body);

  // If validation fails, return 422 with a structured list of field errors
  if (!result.success) {
    // We extract the error messages into a simple array of strings for the frontend
    const errorMessages = result.error.issues.map((issue) => issue.message);

    return res.status(422).json({
      message: 'Dados de despesa inválidos.',
      errors: errorMessages,
    });
  }

  /**
   * Overwrite req.body with sanitized and coerced data.
   * This ensures dates are converted from strings to Date objects automatically.
   */
  req.body = result.data as ExpenseBody;

  next();
};

export default validateExpense;
