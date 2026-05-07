import { z } from 'zod';

// Validation schema for member registration and updates
export const memberSchema = z.object({
  name: z.string().trim().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  cpf: z
    .string()
    .trim()
    .length(14, 'CPF inválido (formato esperado: 000.000.000-00)'),
  email: z.string().trim().email('Formato de e-mail inválido'),
  phone: z.string().trim().min(8, 'O telefone é obrigatório e deve ser válido'),
  dueDay: z.coerce
    .number()
    .int('O dia de vencimento deve ser um número inteiro')
    .min(1, 'O dia mínimo é 1')
    .max(28, 'O dia máximo é 28')
    .default(10),
  birthDate: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Formato de data inválido (use AAAA-MM-DD)',
    ),
  restrictions: z.string().optional().or(z.literal('')),
  trainingDays: z
    .array(z.string())
    .min(1, 'Selecione pelo menos um dia de treino'),
  trainingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)'),
  planId: z.coerce.number().positive('O plano é obrigatório e deve ser válido'),
});

// Type inferred from the validation schema for form handling
export type MemberBody = z.infer<typeof memberSchema>;

// Database member interface representation
export interface IMember {
  id?: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  dueDay: number;
  birthDate: string;
  restrictions?: string;
  isActive: boolean;
  trainingDays: string[];
  trainingTime: string;
  planId: number;
  plan?: string;
}

// Interface for dashboard member statistics
export interface IMemberStats {
  expectedRevenue: string | number;
  membersCount: number;
}
