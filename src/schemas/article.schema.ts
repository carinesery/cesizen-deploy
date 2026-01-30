import { z } from "zod";

export const articleStatusEnum = z.enum([
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
]);

export const articleSchema = z.object({
    title: z
        .string()
        .min(3, "Le titre doit faire au moins 3 caractères")
        .max(200, "Le titre ne doit pas dépasser 200 caractères"),
    summary: z
        .string()
        .max(1000, "Le résumé ne doit pas dépasser 1000 caractères")
        .optional(),
    content: z
        .string()
        .max(10000, "Le contenu ne doit pas dépasser 10000 caractères")
        .optional(),
    presentationImageUrl: z
        .url()
        .max(255, "L'URL ne doit pas dépasser 255 caractères")
        .optional(),
    status: articleStatusEnum.optional(),
});

export const createArticleSchema = articleSchema;
export const updateArticleSchema = articleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;