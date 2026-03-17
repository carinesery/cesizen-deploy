import { z } from "zod";
import { LevelEmotionEnum } from "../utils/enum.js";

export const getEmotionParamsSchema = z.object({
  id: z.cuid()
})

export type getEmotionParamsInput = z.infer<typeof getEmotionParamsSchema>;

export const createEmotionSchema = z.object({
    title: z.string().min(1, "Le titre doit comporter au moins 1 caractère").max(50, "Le titre ne doit dépasser 50 caractères"),
    description: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
    iconUrl: z.string().max(255, "L'url ne doit pas dépasser 255 caractères").optional(),
    level: z.enum(LevelEmotionEnum),
    parentEmotionId: z.cuid().optional()
})

export type createEmotionInput = z.infer<typeof createEmotionSchema>;

/** model Emotion {
  idEmotion       String       @id @default(cuid())
  title           String       @unique @db.VarChar(50)
  description     String?      @db.Text
  iconUrl         String?      @db.VarChar(255)
  level           EmotionLevel
  parentEmotionId String?

  // Relations
  parentEmotion Emotion?    @relation("emotionHierarchy", fields: [parentEmotionId], references: [idEmotion])
  childEmotions Emotion[]   @relation("emotionHierarchy")
  emotionEntry  MoodEntry[] @relation("emotionEntry")
  feelingEntry  MoodEntry[] @relation("feelingEntry")
} */