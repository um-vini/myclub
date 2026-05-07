import type { Request, Response, NextFunction } from 'express';
import { paymentSchema, type PaymentBody } from '../interfaces/Payment.js';

/**
 * Middleware to validate payment data using Zod schema.
 */
const validatePayment = (req: Request, res: Response, next: NextFunction) => {
  // Use safeParse to prevent the application from throwing errors during validation
  const result = paymentSchema.safeParse(req.body);

  // If validation fails, return 422 with a structured list of field errors
  if (!result.success) {
    // Exttraímos as mensagens de erro para um array simples de strings
    const errorMessages = result.error.issues.map((issue) => issue.message);

    return res.status(422).json({
      message: 'Dados de pagamento inválidos.',
      error: errorMessages,
    });
  }

  /**
   * Overwrite req.body with sanitized data.
   */
  req.body = result.data as PaymentBody;

  next();
};

export default validatePayment;
