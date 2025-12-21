import { Container } from "@mui/material";
import EventsList from "../components/EventsList";
import {
  type ExtendedEvent,
  type PresentableEvent,
  ScheduleType,
} from "../types";

import { readFileSync } from "fs";
import { resolve } from "path";
import { z } from "zod";
import {
  selfOrganizedEventsArraySchema,
  type selfOrganizedEventSchema,
} from "./_schema";
import { env } from "./env";

type APIEvent = z.infer<typeof selfOrganizedEventSchema>;

// Room UUID to name mapping
type RoomMap = Map<string, string>;

// Fetch rooms from schedule.json to get UUID -> name mapping
async function fetchRoomMap(): Promise<RoomMap> {
  const response = await fetch(env.SCHEDULE_URI, {
    next: { revalidate: 3600, tags: ["rooms"] }, // 1 hour cache for rooms (in seconds)
  });
  const data = await response.json();
  const rooms = data?.schedule?.conference?.rooms || [];
  const roomMap = new Map<string, string>();
  for (const room of rooms) {
    if (room.guid && room.name) {
      roomMap.set(room.guid, room.name);
    }
  }
  return roomMap;
}

// Map API event to ExtendedEvent format
const mapEvent = (event: APIEvent, roomMap: RoomMap): ExtendedEvent => {
  // Resolve room: try location first, then lookup UUID in roomMap
  let room = event.location;
  if (!room && event.room) {
    room = roomMap.get(event.room) || "[MISSING LOCATION]";
  }
  if (!room) {
    room = "[MISSING LOCATION]";
  }

  return {
    id: 0,
    guid: event.id,
    title: event.name,
    subtitle: null,
    date: event.schedule_start,
    start: event.schedule_start.split("T")[1]?.slice(0, 5) || "00:00",
    duration: event.schedule_duration,
    room,
    slug: event.slug,
    url: event.url || "",
    language: event.language || null,
    track: event.track || null,
    type: event.kind,
    abstract: "",
    description: event.description || "",
    logo: null,
    persons: [],
    links: [],
    attachments: [],
    day: new Date(event.schedule_start).getDate() - 27, // Convert day 27-30 to index 0-3
    // Use 'kind' field: 'official' = main event, 'assembly'/'sos' = self-organized
    category:
      event.kind === "official"
        ? ScheduleType.MAIN_EVENT
        : ScheduleType.SELF_ORGANIZED_EVENT,
  };
};

// Fetch all events from single endpoint
async function fetchAllEvents(): Promise<{
  schedule: PresentableEvent;
  selfOrganizedSchedule: PresentableEvent;
}> {
  // Fetch room mapping and events in parallel
  const [roomMap, eventsResponse] = await Promise.all([
    fetchRoomMap(),
    fetch(env.SELF_ORGANIZED_SCHEDULE_URI, {
      next: { revalidate: 300, tags: ["events"] }, // 5 minutes (in seconds)
    }),
  ]);

  const data = await eventsResponse.json();
  const events = selfOrganizedEventsArraySchema.parse(data);

  const mappedEvents = events.map((e) => mapEvent(e, roomMap));

  // Split by category based on 'kind' field
  const mainEvents = mappedEvents.filter(
    (e) => e.category === ScheduleType.MAIN_EVENT
  );
  const selfOrganizedEvents = mappedEvents.filter(
    (e) => e.category === ScheduleType.SELF_ORGANIZED_EVENT
  );

  return {
    schedule: {
      data: mainEvents,
      version: `official (${mainEvents.length} events)`,
    },
    selfOrganizedSchedule: {
      data: selfOrganizedEvents,
      version: `community (${selfOrganizedEvents.length} events)`,
    },
  };
}

async function fetchData(): Promise<{
  schedule: PresentableEvent;
  selfOrganizedSchedule: PresentableEvent;
}> {
  if (process.env.USE_FAKE_EVENTS === "true") {
    const json = readFileSync(resolve(__dirname, "../", "db.json"), "utf-8");
    const parsed = JSON.parse(json);
    // For mock data, treat all as main events
    const events = selfOrganizedEventsArraySchema.safeParse(parsed);
    if (events.success) {
      const emptyRoomMap = new Map<string, string>();
      const mapped = events.data.map((e) => mapEvent(e, emptyRoomMap));
      return {
        schedule: { data: mapped, version: "MOCK-SCHEDULE" },
        selfOrganizedSchedule: { data: [], version: "MOCK-NO-DATA" },
      };
    }
    return {
      schedule: { data: [], version: "MOCK-PARSE-ERROR" },
      selfOrganizedSchedule: { data: [], version: "MOCK-NO-DATA" },
    };
  }

  try {
    return await fetchAllEvents();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
}

export default async function HomePage() {
  const { schedule, selfOrganizedSchedule } = await fetchData();
  return (
    <Container style={{ paddingTop: 8, maxWidth: "100%" }}>
      <EventsList
        schedule={schedule}
        selfOrganizedSchedule={selfOrganizedSchedule}
      />
    </Container>
  );
}

// Caching configuration:
// - rooms: revalidate every 1 hour (3600s), tagged "rooms"
// - events: revalidate every 5 minutes (300s), tagged "events"
// Use `revalidateTag("events")` or `revalidateTag("rooms")` for on-demand revalidation
