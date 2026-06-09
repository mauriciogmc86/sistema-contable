import { z } from 'zod';

export const JournalEntryLineSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  accountCode: z.string(),
  accountName: z.string(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  description: z.string().default(''),
});

export const CreateJournalEntrySchema = z.object({
  companyId: z.string(),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  lines: z.array(JournalEntryLineSchema).min(1, 'Se requiere al menos una línea'),
});

export const UpdateJournalEntrySchema = CreateJournalEntrySchema.extend({
  id: z.string(),
});

export type JournalEntryLineDTO = z.infer<typeof JournalEntryLineSchema>;
export type CreateJournalEntryDTO = z.infer<typeof CreateJournalEntrySchema>;
export type UpdateJournalEntryDTO = z.infer<typeof UpdateJournalEntrySchema>;
