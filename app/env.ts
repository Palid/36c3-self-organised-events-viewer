import { z } from "zod";

const envSchema = z.object({
  EVENT_NAME: z.string(),
  SCHEDULE_URI: z.string(),
  SELF_ORGANIZED_SCHEDULE_URI: z.string(),
  USE_FAKE_EVENTS: z.string().transform(x => x === "true").optional().default(""),
});

export const env = envSchema.parse(process.env);
