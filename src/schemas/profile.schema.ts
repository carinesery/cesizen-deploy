import { z } from "zod";

export const updatedProfileUserSchema = z.object({
    username: z
        .string()
        .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères")
        .max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères")
        .optional(),
    profilPictureUrl: z
        .url()
        .max(500, "L'url ne doit pas dépasser 500 caractères")
        .optional(),
    email: z
        .email()
        .max(255, "L'email ne doit pas dépasser 255 caractères")
        .optional(),
});

export type UpdatedProfileUserInput = z.infer<typeof updatedProfileUserSchema>;
