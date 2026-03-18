import { z } from "zod";
import { LevelEmotionEnum } from "../utils/enum.js";

export const getEmotionParamsSchema = z.object({
  id: z.cuid()
})

export type GetEmotionParamsInput = z.infer<typeof getEmotionParamsSchema>;

export const createEmotionSchema = z.object({
    title: z.string().min(1, "Le titre doit comporter au moins 1 caractère").max(50, "Le titre ne doit dépasser 50 caractères"),
    description: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
    iconUrl: z.string().max(255, "L'url ne doit pas dépasser 255 caractères").optional(),
    level: z.enum(LevelEmotionEnum),
    parentEmotionId: z.cuid().optional()
})

export type CreateEmotionInput = z.infer<typeof createEmotionSchema>;

export const updateEmotionParamsSchema = z.object({
   id: z.cuid()
})

export type UpdateEmotionParamsInput = z.infer<typeof updateEmotionParamsSchema>;

export const updateEmotionBodySchema = z.object({
    title: z.string().min(1, "Le titre doit comporter au moins 1 caractère").max(50, "Le titre ne doit dépasser 50 caractères").optional(),
    description: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
    iconUrl: z.string().max(255, "L'url ne doit pas dépasser 255 caractères").optional(),
    level: z.enum(LevelEmotionEnum).optional(),
    parentEmotionId: z.cuid().nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Au moins un champ doit être modifié"
  }
);

export type UpdateEmotionBodyInput = z.infer<typeof updateEmotionBodySchema>;

export const deleteEmotionParamsSchema = z.object({
  id: z.cuid(),
})

export type DeleteEmotionParamsInput = z.infer<typeof deleteEmotionParamsSchema>;