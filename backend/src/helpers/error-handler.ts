import type { Response } from 'express';
import { ValidationError, DatabaseError } from 'sequelize';

/**
 * Standardized backend error handler to format responses for the frontend.
 */
export const handleControllerError = (
  res: Response,
  error: unknown,
  defaultMessage: string,
) => {
  // 1. Safe extraction of the error message
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  // 2. Sequelize Validation Errors (Returns an array for Sonner toasts)
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: 'Erro de validação nos dados fornecidos.',
      error: error.errors.map((e) => e.message),
    });
  }

  // 3. Database structure errors (Helps debugging on Fedora/MySQL)
  if (error instanceof DatabaseError) {
    return res.status(500).json({
      message: 'Erro de estrutura no banco de dados.',
      error: error.message,
    });
  }

  // 4. Default fallback for unexpected errors
  return res.status(500).json({
    message: defaultMessage,
    error: errorMessage,
  });
};
