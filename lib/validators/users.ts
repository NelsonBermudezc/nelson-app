import { z } from "zod";

import { SUBSCRIPTION_STATUSES } from "@/lib/types/domain";
import { normalizePhoneNumber } from "@/lib/utils/phone";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa formato YYYY-MM-DD.");

const baseUserInputFields = {
  full_name: z.string().trim().min(3, "Nombre demasiado corto."),
  whatsapp: z.string().trim(),
  whatsapp_country: z.string().trim().length(2).optional(),
  plan: z.string().trim().min(2, "Plan requerido."),
  amount_cents: z.coerce.number().int().positive("Monto invalido."),
  start_date: isoDateSchema,
  source: z.string().trim().min(2, "Origen requerido.").default("manual"),
};

function normalizeWhatsapp<T extends { whatsapp: string; whatsapp_country?: string }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  const normalized = normalizePhoneNumber(data.whatsapp, data.whatsapp_country);

  if (!normalized.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["whatsapp"],
      message: normalized.message,
    });
    return z.NEVER;
  }

  const { whatsapp_country, ...rest } = data;
  return {
    ...rest,
    whatsapp: normalized.value,
  };
}

export const createUserInputSchema = z
  .object({
    ...baseUserInputFields,
    status: z.enum(SUBSCRIPTION_STATUSES).default("activa"),
    next_billing_date: isoDateSchema.nullable().optional(),
  })
  .transform((data, ctx) => normalizeWhatsapp(data, ctx));

export const updateUserInputSchema = z
  .object({
    ...baseUserInputFields,
    status: z.enum(SUBSCRIPTION_STATUSES),
    next_billing_date: isoDateSchema.nullable(),
  })
  .transform((data, ctx) => normalizeWhatsapp(data, ctx));

export const listUsersInputSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(SUBSCRIPTION_STATUSES).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
