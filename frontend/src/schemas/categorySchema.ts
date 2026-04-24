import { z } from "zod";

export const createCategoryBodySchema = z.object({
    title: z
        .string()
        .min(3, "Le titre doit faire au moins 3 caractères")
        .max(200, "Le titre ne doit pas dépasser 200 caractères"),
    description: z
        .string()
        .max(1000, "Le résumé ne doit pas dépasser 1000 caractères")
        .optional(),
})

export type CreateCategoryBodyInput = z.infer<typeof createCategoryBodySchema>;


export const updateCategoryBodySchema = z.object({
    title: z
        .string()
        .min(3, "Le titre doit faire au moins 3 caractères")
        .max(200, "Le titre ne doit pas dépasser 200 caractères")
        .optional(),
    description: z
        .string()
        .max(1000, "Le résumé ne doit pas dépasser 1000 caractères")
        .nullable()
        .optional(),
    removeIcon: z.preprocess(
        (val) => val === 'true' || val === true,
        z.boolean().optional())
    //    iconUrl: z
    //         .string()
    //         .max(255, "L'URL ne doit pas dépasser 255 caractères")
    //         .nullable()
    //         .optional(),
});

export type UpdateCategoryBodyInput = z.infer<typeof updateCategoryBodySchema>;
