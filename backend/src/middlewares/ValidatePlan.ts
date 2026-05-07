import type { Request, Response, NextFunction } from 'express';
import { planSchema, type PlanBody } from '../interfaces/Plan.js';

/**
 * Middleware to validate membership plan data using Zod schema.
 */
const validatePlan = (req: Request, res: Response, next: NextFunction) => {
  // safeParse prevents the app from crashing and returns a structured validation result
  const result = planSchema.safeParse(req.body);

  // If validation fails, return 422 with specific field errors for the frontend
  if (!result.success) {
    // Extraímos as mensagens de erro para um array simples de strings para o handleApiError
    const errorMessages = result.error.issues.map((issue) => issue.message);

    return res.status(422).json({
      message: 'Dados do plano inválidos.',
      error: errorMessages,
    });
  }

  /**
   * Overwrite req.body with sanitized data from Zod.
   */
  req.body = result.data as PlanBody;

  next();
};

export default validatePlan;
