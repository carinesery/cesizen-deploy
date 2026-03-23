import { z } from "zod";
import { UserRoleEnum } from "../utils/enum.js";

export const getUserParamsSchema = z.object({
    id: z.cuid(),
})

export type GetUserParamsInput = z.infer<typeof getUserParamsSchema>;

export const adminRegisterSchema = z.object({
    username: z
        .string()
        .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères")
        .max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères"),
    email: z
        .email()
        .max(255, "L'email ne doit pas dépasser 255 caractères"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,50}$/, "Le mot de passe est invalide")
        .max(50, "Le mot de passe ne doit pas dépasser 50 caractères"),
    confirmPassword: z.string(),
    role: z.enum(UserRoleEnum)
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;

export const adminUpdateUserParamsSchema = z.object({
    id: z.cuid(),
})

export type AdminUpdateUserParamsInput = z.infer<typeof adminUpdateUserParamsSchema>;

export const adminUpdateUserBodySchema = z.object({
    username: z
        .string()
        .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères")
        .max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères")
        .optional(),
    profilPictureUrl: z
        .string()
        .max(500, "L'url ne doit pas dépasser 500 caractères")
        .nullable()
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

export type AdminUpdateUserBodyInput = z.infer<typeof adminUpdateUserBodySchema>;

export const userStatusParamsSchema = z.object({
    id: z.cuid()
})

export type UserStatusParamsInput = z.infer<typeof userStatusParamsSchema>;

export const userStatusBodySchema = z.object({
    isActive: z.boolean()
})

export type UserStatusBodyInput = z.infer<typeof userStatusBodySchema>;

export const deleteUserParamsSchema = z.object({
    id: z.cuid(),
})

export type DeleteUserParamsInput = z.infer<typeof deleteUserParamsSchema>;