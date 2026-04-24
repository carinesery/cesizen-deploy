import { z } from "zod";

export const articleStatusEnum = z.enum([
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
]);

export const createArticleBodySchema = z.object({
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
    status: articleStatusEnum.optional(),
    categories: z.preprocess((val) => {
        if (val === undefined || val === null) return undefined;
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
            if (val === "") return undefined;
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }
        }
        return undefined;
    }, z.array(z.string())).optional(),
});

export type CreateArticleBodyInput = z.infer<typeof createArticleBodySchema>;


export const updateArticleBodySchema = z.object({
    title: z
        .string()
        .min(3, "Le titre doit faire au moins 3 caractères")
        .max(200, "Le titre ne doit pas dépasser 200 caractères")
        .optional(),
    summary: z
        .string()
        .max(1000, "Le résumé ne doit pas dépasser 1000 caractères")
        .nullable()
        .optional(),
    content: z
        .string()
        .max(10000, "Le contenu ne doit pas dépasser 10000 caractères")
        .nullable()
        .optional(),
     removePresentationImage: z.preprocess(
        (val) => val === 'true' || val === true,
        z.boolean().optional()),
    status: articleStatusEnum.optional(),
    categories: z.preprocess((val) => {
        // undefined ou null = ne rien changer aux catégories
        if (val === undefined || val === null) return undefined;

        // array vide = supprimer toutes les catégories
        if (Array.isArray(val)) return val;

        // string JSON: "[\"cat1\", \"cat2\"]"
        if (typeof val === "string") {
            if (val === "") return undefined; // string vide = ne rien changer
            
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                // string simple: "cat1, cat2, cat3"
                return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }
        }

        return undefined; // fallback
    }, z.array(z.string()).optional()),
});

export type UpdateArticleBodyInput = z.infer<typeof updateArticleBodySchema>;