import { z } from "zod";

export const trackSchema = z.object({
  name: z.string(),
  color: z.string(),
  slug: z.string(),
});

export const assemblySchema = z.object({
  name: z.string(),
  slug: z.string(),
  guid: z.string(),
});

export const roomSchema = z.object({
  name: z.string(),
  slug: z.string(),
  guid: z.string(),
  type: z.string(),
  stream_id: z.string().nullable(),
  capacity: z.number(),
  description_en: z.string().nullable().optional(),
  description_de: z.string().nullable().optional(),
  features: z.record(z.string()).optional(),
  assembly: assemblySchema,
});

export const personSchema = z.object({
  guid: z.string(),
  name: z.string(),
  public_name: z.string(),
  avatar: z.string().nullable(),
  biography: z.string().nullable().optional(),
  url: z.string(),
});

export const linkSchema = z.object({
  url: z.string(),
  title: z.string(),
});

export const attachmentSchema = z.object({
  url: z.string(),
  title: z.string(),
});

export const eventSchema = z.object({
  guid: z.string(),
  id: z.number(),
  date: z.string(),
  start: z.string(),
  duration: z.string(),
  room: z.string(),
  slug: z.string(),
  url: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  language: z.string().nullable(),
  track: z.string().nullable(),
  type: z.string(),
  abstract: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  persons: z.array(personSchema),
  links: z.array(linkSchema).optional(),
  attachments: z.array(attachmentSchema).optional(),
  feedback_url: z.string().optional(),
  recording_license: z.string().optional(),
  do_not_record: z.boolean().optional(),
  do_not_stream: z.boolean().optional(),
});

export const daySchema = z.object({
  index: z.number(),
  date: z.string(),
  day_start: z.string(),
  day_end: z.string(),
  rooms: z.record(z.array(eventSchema)),
});

export const conferenceSchema = z.object({
  acronym: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  daysCount: z.number(),
  timeslot_duration: z.string(),
  time_zone_name: z.string(),
  url: z.string(),
  tracks: z.array(trackSchema),
  rooms: z.array(roomSchema),
  assembly: z.record(assemblySchema).optional(),
  days: z.array(daySchema),
});

export const scheduleSchema = z.object({
  version: z.string(),
  base_url: z.string(),
  conference: conferenceSchema,
});

export const dataSchema = z.object({
  $schema: z.string(),
  schedule: scheduleSchema,
});
