import { z } from 'zod';

// Validation schema for user registration and password confirmation
export const userSchema = z
  .object({
    name: z.string().trim().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.string().trim().email('Insira um endereço de e-mail válido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'A confirmação de senha é obrigatória'),
    isAdmin: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

// Type inferred from the validation schema
export type UserBody = z.infer<typeof userSchema>;

// Database user interface representation
export interface IUser {
  id?: number;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for login request body
export interface LoginBody {
  email: string;
  password: string;
}

// Interface for registration request body
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
