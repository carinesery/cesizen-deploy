import { z } from "zod";

export const createMoodEntrySchema = z.object({
    emotionId: z.number(),
    feelingId: z.number().optional(),
    parentEmotionIntensity: z.number(),
    comment: z.string().max(500).optional()
})

// Je devrais utiliser des cuid ou uuid pour les émotions ? je devrais le faire maintenant ou je le fait à la fin du crud comme ca c'est plus facile à tester ? Je dois faire le schema zod : export const createMoodEntrySchema = z.object({
//     emotionId: z.number(),
//     feelingId: z.number().optional(), 
//     parentEmotionIntensity: z.number(),
//     comment: z.string().max(500).optional()??? 
// }) là je vais m'occuper du post. Ah ok