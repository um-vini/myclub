import type { Request, Response, NextFunction } from 'express';
import { memberSchema, type MemberBody } from '../interfaces/Member.js';

/**
 * Middleware to validate member data using Zod schema.
 */
const validateMember = (req: Request, res: Response, next: NextFunction) => {
  const result = memberSchema.safeParse(req.body);

  if (!result.success) {
    // Usamos result.error.issues para garantir que o array exista antes do map
    const errorMessages = result.error.issues.map((issue) => issue.message);

    return res.status(422).json({
      message: 'Falha na validação dos dados.',
      error: errorMessages, // Enviando como 'error' para o seu handleApiError ler o array
    });
  }

  /**
   * Overwrite req.body with the sanitized and parsed data from Zod.
   */
  req.body = result.data as MemberBody;

  next();
};

export default validateMember;
