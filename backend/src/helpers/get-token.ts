import type { Request } from 'express';

/**
 * Extracts the JWT token from the 'Authorization' header.
 * Validates the 'Bearer <token>' format to ensure the request is properly structured.
 */
const getToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;

  // Verify if the authorization header exists
  if (!authHeader) {
    return undefined;
  }

  /**
   * Split the header into parts.
   * Expected format: ["Bearer", "access_token_string"]
   */
  const parts = authHeader.split(' ');

  // Validate the structure and the Bearer prefix
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return undefined;
  }

  const token = parts[1];

  return token;
};

export default getToken;
