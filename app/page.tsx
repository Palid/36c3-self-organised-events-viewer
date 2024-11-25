import { Container } from "@mui/material";
import EventsList from "../components/EventsList";
import { type Data, type ExtendedEvent, type Schedule } from "../types";

import { readFileSync } from "fs";
import { resolve } from "path";

async function fetchData() {
  if (process.env.USE_FAKE_EVENTS === "true") {
    const json = readFileSync(resolve(__dirname, "../", "db.json"), "utf-8");
    const parsed = JSON.parse(json);
    return {
      data: parseData(parsed.schedule),
      version: parsed.schedule.version,
    };
  }
  try {
    const data = await fetch(process.env.SCHEDULE_URI, {
      next: {
        revalidate: 1000 * 5 * 60, // 5minutes
      },
    })
      .then((x) => x.json())
      .then((data: Data) => ({
        data: parseData(data.schedule),
        version: data.schedule.version,
      }));

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
}

const parseData = (schedule: Schedule): ExtendedEvent[] => {
  const data: ExtendedEvent[] = [];

  for (const day in schedule.conference.days) {
    const rooms = schedule.conference.days[day].rooms;
    for (const room in rooms) {
      const events = rooms[room];
      for (const eventName in events) {
        const event = events[eventName];
        data.push({ ...event, room, day: parseInt(day, 10) });
      }
    }
  }
  return data;
};

export default async function HomePage() {
  const { data, version } = await fetchData();
  return (
    <Container style={{ paddingTop: 8, maxWidth: "100%" }}>
      <EventsList events={data} version={version} />
    </Container>
  );
}

export const dynamic = "force-dynamic";
