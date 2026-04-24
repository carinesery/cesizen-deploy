import { z } from "zod";

export const getStatsQuerySchema = z.object({
  period: z.enum(["week", "month", "year"])
});

export type getStatsQueryInput = z.infer<typeof getStatsQuerySchema>;