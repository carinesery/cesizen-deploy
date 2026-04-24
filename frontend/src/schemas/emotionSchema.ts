import { z } from 'zod';

export enum LevelEmotionEnum {
  LEVEL_1 = "LEVEL_1",
  LEVEL_2 = "LEVEL_2",
}

export const createEmotionBodySchema = z.object({
  title: z.string().min(1, "Le titre doit comporter au moins 1 caractère").max(50, "Le titre ne doit dépasser 50 caractères"),
  description: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
  // iconUrl: z.string().max(255, "L'url ne doit pas dépasser 255 caractères").optional(),
  level: z.enum(LevelEmotionEnum),
  parentEmotionId: z.cuid("Lémotion principale n'est pas valide.").optional()
})

export type CreateEmotionBodyInput = z.infer<typeof createEmotionBodySchema>;


export const updateEmotionBodySchema = z.object({
  title: z.string().min(1, "Le titre doit comporter au moins 1 caractère").max(50, "Le titre ne doit dépasser 50 caractères").optional(),
  description: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
  removeIcon: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional()),
    // iconUrl: z.string().max(255, "L'url ne doit pas dépasser 255 caractères").nullable().optional(),
    level: z.enum(LevelEmotionEnum).optional(),
  parentEmotionId: z.cuid().nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Au moins un champ doit être modifié"
  }
);

export type UpdateEmotionBodyInput = z.infer<typeof updateEmotionBodySchema>;
