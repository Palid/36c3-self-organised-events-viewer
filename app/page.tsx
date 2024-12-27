import { Container } from "@mui/material";
import EventsList from "../components/EventsList";
import { type Data, type ExtendedEvent, type PresentableEvent, type Schedule, ScheduleType } from "../types";

import { readFileSync } from "fs";
import { resolve } from "path";
import { env } from "./env";




function fetchAndParse({
  url,
  type,
}: {
  url: string,
  type: ScheduleType
}) {
  return fetch(url, {
    next: {
      revalidate: 1000 * 5 * 60, // 5minutes
    },
  })
    .catch(e => {
      console.error(e);
      throw e;
    })
    .then((x) => x.json())
    .then((data: Data) => ({
      data: parseData(data.schedule, type),
      version: data.schedule.version,
    }));
}

async function fetchData(): Promise<{
  schedule: PresentableEvent,
  selfOrganizedSchedule: PresentableEvent
}> {
  if (process.env.USE_FAKE_EVENTS === "true") {
    const json = readFileSync(resolve(__dirname, "../", "db.json"), "utf-8");
    const parsed = JSON.parse(json);
    return {
      schedule: {
        data: parseData(parsed.schedule, ScheduleType.MAIN_EVENT),
        version: 'MOCK-SCHEDULE',
      },
      selfOrganizedSchedule: {
        data: [],
        version: 'MOCK-NO-DATA',
      }
    };
  }
  try {
    const [schedule, selfOrganizedSchedule] = await
      Promise.all([fetchAndParse({
        url: env.SCHEDULE_URI,
        type: ScheduleType.MAIN_EVENT
      }), fetchAndParse({
        url: env.SELF_ORGANIZED_SCHEDULE_URI,
        type: ScheduleType.SELF_ORGANIZED_EVENT
      })]);
    return { schedule, selfOrganizedSchedule }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }

}

const parseData = (schedule: Schedule, type: ScheduleType): ExtendedEvent[] => {

  const results: ExtendedEvent[] = []
  for (const day in schedule.conference.days) {
    const rooms = schedule.conference.days[day].rooms;
    for (const room in rooms) {
      const events = rooms[room];
      for (const eventName in events) {
        const event = events[eventName];
        results.push({ ...event, room, day: parseInt(day, 10), category: type });
      }
    }
  }
  return results
};


export default async function HomePage() {
  const { schedule, selfOrganizedSchedule } = await fetchData();
  return (
    <Container style={{ paddingTop: 8, maxWidth: "100%" }}>
      <EventsList schedule={schedule} selfOrganizedSchedule={selfOrganizedSchedule} />
    </Container>
  );
}

export const dynamic = "force-dynamic";
