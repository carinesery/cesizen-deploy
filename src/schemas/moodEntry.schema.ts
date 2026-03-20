import { z } from "zod";

export const createMoodEntrySchema = z.object({
  emotionDate: z
    .union([
      z.undefined(),
      z.preprocess((val) => {
        // Valeurs interdites pouvant être transformées en date
        if (val === null || val === "" || val === 0 || val === false || val === true || typeof val === "number") {
          return new Date("invalid");
        }

        // Filtre les strings qui ne sont pas au format ISO attendu
        if (typeof val === "string") {
          if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/.test(val)) {
            return new Date("invalid");
          }
        }

        const date = new Date(val as any);
        // Check que le date générée correspond bien à l'input (ex: 1987-02-31 devient 1987-03-03)
        if (typeof val === "string") {
          const [year, month, day] = val.split("T")[0].split("-").map(Number);
          if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return new Date("invalid");
          }
        }

        return date;
      }, z.date())
    ])
    .refine((date) => {
      // undefined → OK
      if (date === undefined) return true;

      // ❌ date invalide
      if (Number.isNaN(date.getTime())) return false;

      // ❌ futur
      return date <= new Date();
    }, {
      message: "Date invalide ou dans le futur",
    }),
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