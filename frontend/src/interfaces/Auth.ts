export interface TokenPayload {
  id: number;
  name: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}
