import { z } from 'zod';

export const CreateCompanySchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  taxIdentifier: z.string().min(1, 'El documento fiscal es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'El teléfono es requerido'),
});

export const UpdateCompanySchema = CreateCompanySchema.partial().extend({
  id: z.string(),
});

export type CreateCompanyDTO = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyDTO = z.infer<typeof UpdateCompanySchema>;
