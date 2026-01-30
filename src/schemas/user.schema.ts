import { z } from "zod";

export const UserRoleEnum = z.enum([
    "USER",
    "ADMIN",
]);

export const userRegisterSchema = z.object({
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
    termsConsent: z.boolean("Vous devez accepter les conditions"),
    privacyConsent: z.boolean("Vous devez accepter la politique de confidentialité"),
    role: UserRoleEnum.optional() // optionnal car Zod n'enverra rien pour un utilisateur normal
});

export const userLoginSchema = z.object({
    email: z
        .email("L'email est invalide")
        .max(50, "L'email ne doit pas dépasser 50 caractères"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const registerUserSchema = userRegisterSchema;
export const loginUserSchema = userLoginSchema;

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;