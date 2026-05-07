import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to administrator users only.
 * Checks the 'isAdmin' flag
 */
const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const isAdmin = req.user?.isAdmin;

  // Verify if the authenticated user has administrative privileges
  if (!isAdmin) {
    return res.status(403).json({
      message:
        'Acesso negado! Esta operação requer privilégios de administrador.',
    });
  }

  // User is admin, proceed to the next middleware or controller
  next();
};

export default checkAdmin;
