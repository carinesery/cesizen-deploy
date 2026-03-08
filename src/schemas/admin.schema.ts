import { z } from "zod";
import { UserRoleEnum } from "../utils/enum.js";

export const adminRegisterSchema = z.object({
    username: z
        .string()
        .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères")
        .max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères"),
    profilPictureUrl: z
        .url()
        .max(500, "L'url ne doit pas dépasser 500 caractères")
        .optional(),
    email: z
        .email()
        .max(255, "L'email ne doit pas dépasser 255 caractères"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,50}$/, "Le mot de passe est invalide")
        .max(50, "Le mot de passe ne doit pas dépasser 50 caractères"),
    role: z.enum(UserRoleEnum)
});

export const adminUpdateUserSchema = z.object({
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
    role: z.enum(UserRoleEnum).optional()
}).refine(
    data => Object.keys(data).length > 0,
    { message: "Au moins un champ doit être modifié" }
);