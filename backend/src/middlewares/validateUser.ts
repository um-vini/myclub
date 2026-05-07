import type { Request, Response, NextFunction } from 'express';
import { userSchema, type UserBody } from '../interfaces/User.js';

/**
 * Middleware to validate user registration and update data using Zod.
 */
const validateUser = (req: Request, res: Response, next: NextFunction) => {
  // safeParse validates the body against userSchema (including password match refinement)
  const result = userSchema.safeParse(req.body);

  // If validation fails, return 422 with structured field errors
  if (!result.success) {
    // Mapeamos as mensagens de erro para o array 'error' esperado pelo frontend
    const errorMessages = result.error.issues.map((issue) => issue.message);

    return res.status(422).json({
      message: 'Dados de usuário inválidos.',
      error: errorMessages,
    });
  }

  /**
   * Remove 'confirmPassword' from the validated data.
   * This prevents unnecessary fields from being passed to the database model.
   */
  const { confirmPassword, ...validData } = result.data;

  // Update the request body with sanitized and validated data
  req.body = validData as UserBody;

  next();
};

export default validateUser;
