import { z } from 'zod';
import { AccountType } from '@/domain/entities';

export const CreateAccountSchema = z.object({
  companyId: z.string(),
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.nativeEnum(AccountType),
  parentId: z.string().nullable(),
});

export const UpdateAccountSchema = CreateAccountSchema.partial().extend({
  id: z.string(),
});

export type CreateAccountDTO = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountDTO = z.infer<typeof UpdateAccountSchema>;
