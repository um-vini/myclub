import { createContext } from 'react';

// User profile information
export interface User {
  name: string;
  email: string;
  avatar: string;
}

// Data and functions exposed by the authentication context
interface AuthContextData {
  authenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Context object initialized with an empty object cast to its type
export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);
