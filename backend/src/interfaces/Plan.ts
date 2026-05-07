import { z } from 'zod';

// Validation schema for creating and updating membership plans
export const planSchema = z.object({
  name: z.string().trim().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  price: z.coerce.number().positive('O preço deve ser um valor positivo'),
  timesPerWeek: z.coerce
    .number()
    .int('A frequência deve ser um número inteiro')
    .min(1, 'No mínimo 1 vez por semana')
    .max(7, 'No máximo 7 vezes por semana'),
});

// Type inferred from the schema for internal data handling
export type PlanBody = z.infer<typeof planSchema>;

// Database plan interface representation
export interface IPlan {
  id?: number;
  name: string;
  price: number;
  timesPerWeek: number;
  isActive: boolean;
}
