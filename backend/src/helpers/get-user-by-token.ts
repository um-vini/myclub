import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface TokenPayload {
  id: number;
  isAdmin: boolean;
}

/**
 * Retrieves a user from the database based on a provided JWT token.
 * Validates the token signature and returns the user record without sensitive fields.
 */
const getUserByToken = async (token: string): Promise<User | null> => {
  // If no token is provided, return null immediately
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET as string;

    // Verify the JWT signature
    const decoded = jwt.verify(token, secret) as TokenPayload;
    const userId = decoded.id;

    // Fetch the user by primary key, excluding sensitive/internal metadata
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });

    return user;
  } catch (error) {
    // Return null if the token is invalid, expired, or the user does not exist
    return null;
  }
};

export default getUserByToken;
