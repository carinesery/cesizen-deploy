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

      const [year, month, day] = val.split("T")[0].split("-").map(Number);

      const date = new Date(year, month - 1, day);

      // Permet de vérifier que la date existe vraiment
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
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      const minDate = new Date(2026, 0, 1);
      return date <= now && date >= minDate;
    }, {
      message: "Date invalide (format invalide ou hors plage autorisée)",
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
  emotionDate: z
    .preprocess((val) => {
      if (val === undefined) return undefined;

      if (typeof val !== "string") return new Date("invalid");

      if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z)?)?$/.test(val)) {
        return new Date("invalid");
      }

      const [year, month, day] = val.split("T")[0].split("-").map(Number);
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        return new Date("invalid");
      }

      return date;
    }, z.date().optional())
    .refine((date) => {
      if (!date) return true;
      if (Number.isNaN(date.getTime())) return false;

      const now = new Date();
      const minDate = new Date(2026, 0, 1);
      return date <= now && date >= minDate;
    }, {
      message: "Date invalide (format invalide ou hors plage autorisée)",
    }),
  emotionId: z.cuid().optional(),
  parentEmotionIntensity: z
    .number()
    .int()
    .min(1, "L'intensité doit être >= 1")
    .max(10, "L'intensité doit être <= 10")
    .optional(),
  feelingId: z.cuid().optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
})

export type updateMoodEntryBodyInput = z.infer<typeof updateMoodEntryBodySchema>;

export const deleteMoodEntryParamsSchema = z.object({
  id: z.cuid(),
})

export type deleteMoodEntryParamsInput = z.infer<typeof deleteMoodEntryParamsSchema>;

export const getStatsQuerySchema = z.object({
  period: z.enum(["week", "month", "year"])
});

export type getStatsQueryInput = z.infer<typeof getStatsQuerySchema>;