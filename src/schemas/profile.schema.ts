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
}).refine(
    data => Object.keys(data).length > 0,
    { message: "Au moins un champ doit être modifié" }
);

export type UpdatedProfileUserInput = z.infer<typeof updatedProfileUserSchema>;


export const updatedPasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,50}$/, "Le mot de passe est invalide")
        .max(50, "Le mot de passe ne doit pas dépasser 50 caractères"),
    newPassword: z
        .string()
        .min(8, "Le mot de passe doit faire au moins 8 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,50}$/, "Le mot de passe est invalide")
        .max(50, "Le mot de passe ne doit pas dépasser 50 caractères"),
});

export type UpdatedPasswordInput = z.infer<typeof updatedPasswordSchema>;
