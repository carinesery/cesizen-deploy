import { z } from "zod";


export const getMoodEntryParamsSchema = z.object({
  id: z.cuid(),
})

export type getMoodEntryParamsInput = z.infer<typeof getMoodEntryParamsSchema>;

export const createMoodEntrySchema = z.object({
  emotionDate: z
    .preprocess((val) => {
      if (val === undefined) return undefined;

      if (typeof val !== "string") return new Date("invalid");

      if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z)?)?$/.test(val)) {
        return new Date("invalid");
      }

      const date = new Date(val);

      if (Number.isNaN(date.getTime())) return new Date("invalid");

      const [year, month, day] = val.split("T")[0].split("-").map(Number);
      if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        return new Date("invalid");
      }

      return date;
    }, z.date())
    .refine((date) => {
      const now = new Date();
      const minDate = new Date("2026-01-01");
      return date <= now && date >= minDate;
    }, {
      message: "Date invalide (hors plage autorisée)",
    })
    .optional(),
  emotionId: z.cuid(),
  parentEmotionIntensity: z
    .number()
    .int()
    .min(1, "L'intensité doit être >= 1")
    .max(10, "L'intensité doit être <= 10"),
  feelingId: z.cuid().optional(),
  comment: z.string().max(500).optional()
})

export type createMoodEntryInput = z.infer<typeof createMoodEntrySchema>;


export const updateMoodEntryParamsSchema = z.object({
  id: z.cuid(),
})

export type updateMoodEntryParamsInput = z.infer<typeof updateMoodEntryParamsSchema>;


export const updateMoodEntryBodySchema = z.object({
  emotionDate: z.date(),// à compléter,
  emotionId: z.cuid(),
  parentEmotionIntensity: z
    .number()
    .int()
    .min(1, "L'intensité doit être >= 1")
    .max(10, "L'intensité doit être <= 10"),
  feelingId: z.cuid().optional().nullable(), // nullable pour écraser ?
  comment: z.string().max(500).optional().nullable(), // nullable pour écraser ?

})

export type updateMoodEntryBodyInput = z.infer<typeof updateMoodEntryBodySchema>;