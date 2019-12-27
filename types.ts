export interface RootObject {
  schedule: Schedule;
}

export interface Schedule {
  version: string;
  base_url: string;
  conference: Conference;
}

export interface Conference {
  acronym: string;
  title: string;
  start: string;
  end: string;
  daysCount: number;
  timeslot_duration: string;
  days: Day[];
}

export interface Day {
  index: number;
  date: string;
  day_start: string;
  day_end: string;
  rooms: Rooms;
}

export interface Rooms {
  [room: string]: Event;
}

export interface Event {
  url: string;
  id: number;
  guid: string;
  logo?: string;
  date: string;
  start: string;
  duration: string;
  room: string;
  slug: string;
  title: string;
  subtitle: string;
  track: string;
  type: string;
  language: string;
  abstract: string;
  description: string;
  recording_license: string;
  do_not_record: boolean;
  persons: Person[];
  links: Link[];
  attachments: Link[][];
}

export interface Link {
  url: string;
  title: string;
}

export interface Person {
  id: number;
  public_name: string;
}
