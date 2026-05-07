import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import getToken from '../helpers/get-token.js';
import type { TokenPayload } from '../interfaces/Auth.js';

/**
 * Middleware to validate the JWT access token for protected routes.
 * Extracts the token, verifies its signature, and injects the payload into the request object.
 */
const checkToken = (req: Request, res: Response, next: NextFunction) => {
  const token = getToken(req);

  // If no token is found in the authorization header
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Acesso negado! Token não fornecido.' });
  }

  try {
    const secret = process.env.JWT_SECRET as string;

    // Verify the token signature
    const verified = jwt.verify(token, secret) as TokenPayload;

    /**
     * Add decoded user data to the request so other middlewares and controllers can use it
     */
    req.user = verified;

    next();
  } catch (error) {
    // Return unauthorized if the token is tampered with or expired
    res.status(401).json({ message: 'Token inválido ou expirado!' });
  }
};

export default checkToken;
