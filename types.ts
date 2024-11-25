import type { SortDirectionType } from "react-virtualized";
import { type infer as zodInfer } from "zod"; // Import Zod type inference
import {
  type dataSchema,
  type daySchema,
  type eventSchema,
  type linkSchema,
  type personSchema,
} from "./app/_schema";

// Import the Zod schemas

// Use Zod to infer TypeScript types
export type Data = zodInfer<typeof dataSchema>;
export type Schedule = Data["schedule"];
export type Conference = Schedule["conference"];
export type Day = zodInfer<typeof daySchema>;
export type Event = zodInfer<typeof eventSchema>;
export type Link = zodInfer<typeof linkSchema>;
export type Person = zodInfer<typeof personSchema>;

// In-app types
export type Language = "en" | "de" | "other";

// Define RootObject using inferred types
export interface RootObject {
  schedule: Schedule;
}

export interface Rooms {
  [room: string]: Event[];
}

export interface ExtendedEvent extends Event {
  day: number;
}

export type TAvailableFields = keyof Event;

export type Filters = {
  day: number;
  fields: TAvailableFields[];
  textFilter: string;
  languages: {
    [key in Language]: boolean;
  };
};

export type Sorting = {
  sortBy: TAvailableFields;
  sortDirection: SortDirectionType;
};

export const AvailableFields: TAvailableFields[] = [
  // "id",
  // "guid",
  // "logo",
  // "slug",
  // "recording_license",
  // "do_not_record",
  // "links",
  // "attachments",
  // "abstract",
  // "language",
  // "url",
  // "persons",
  // "start",
  // "track",
  "title",
  "date",
  "type",
  "duration",
  "room",
  "subtitle",
  "description",
];
