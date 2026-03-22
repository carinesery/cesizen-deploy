import { z } from "zod";

export const registerUserSchema = z.object({
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
    confirmPassword: z.string(),
    termsConsent: z.literal(true, "Vous devez accepter les conditions"),
    privacyConsent: z.literal(true, "Vous devez accepter la politique de confidentialité"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export const confirmEmailSchema = z.object({
    token: z.string().min(1)
});

export const loginUserSchema = z.object({
    email: z
        .email("L'email est invalide")
        .max(50, "L'email ne doit pas dépasser 50 caractères"),
    password: z
        .string()
        .min(1, "Le mot de passe est obligatoire"),
});

export const acceptLegalSchema = z.object({
    termsConsent: z.literal(true, "Vous devez accepter les conditions"),
    privacyConsent: z.literal(true, "Vous devez accepter la politique de confidentialité")
})

export type LoginUserInput = z.infer<typeof loginUserSchema>;


export const forgotPasswordBodySchema = z.object({
    email: z
        .email("L'email est invalide")
        .max(50, "L'email ne doit pas dépasser 50 caractères"),
})

export type forgotPasswordBodyInput = z.infer <typeof forgotPasswordBodySchema>; 

export const resetPasswordBodySchema = z.object({
    token: z.string(),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,50}$/, "Le mot de passe est invalide")
        .max(50, "Le mot de passe ne doit pas dépasser 50 caractères"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export type resetPasswordBodyInput = z.infer <typeof resetPasswordBodySchema>; 
