import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import type { IUser } from '../interfaces/User.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Generates and stores authentication tokens for the user.
 * Provides a short Access Token and a long Refresh Token stored in the database.
 */
const createUserToken = async (user: IUser, req: Request, res: Response) => {
  const secret = process.env.JWT_SECRET as string;
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

  // Access Token: Valid for 15 minutes for security
  const token = jwt.sign(
    { name: user.name, id: user.id, isAdmin: user.isAdmin },
    secret,
    { expiresIn: '15m' },
  );

  // Refresh Token: Valid for 7 days, allowing persistent sessions
  const refreshTokenValue = jwt.sign({ id: user.id }, refreshSecret, {
    expiresIn: '7d',
  });

  // Persist the Refresh Token in the database to allow revocation and rotation
  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user.id!,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in milliseconds
  });

  return res.status(200).json({
    message: 'Autenticado com sucesso!',
    token,
    refreshToken: refreshTokenValue,
    userId: user.id,
    isAdmin: user.isAdmin,
    name: user.name,
  });
};

export default createUserToken;
