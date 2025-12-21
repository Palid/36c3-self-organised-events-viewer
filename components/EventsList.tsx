"use client";

import capitalize from "lodash/capitalize";
import sortByFun from "lodash/sortBy";
import { DateTime } from "luxon";
import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  LiveStatus,
  type EventWithLiveStatus,
  type ExtendedEvent,
  type Filters,
  type PresentableEvent,
  type Sorting,
  type TAvailableFields,
} from "../types";
import { ListFilters } from "./Filters";

import { Paper } from "@mui/material";
import { isAfter, isBefore, subMinutes } from "date-fns";
import { add } from "date-fns/add";
import Link from "next/link";

const formatDate = (date: string) => {
  const l = DateTime.fromISO(date);
  const { day, hour, minute } = l;
  const mapper: Record<number, string> = {
    27: "Day 1",
    28: "Day 2",
    29: "Day 3",
    30: "Day 4",
  };
  return `${mapper[day] || `Day ?`}, ${day}.12 at ${hour
    .toString()
    .padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

const foundDay = (function getChosenDay() {
  const date = new Date();
  const currentDay = date.getDate();
  const currentMonth = date.getMonth() + 1;

  if (currentMonth === 12) {
    const daysToDates = [27, 28, 29, 30];
    const found = daysToDates.findIndex((x) => x === currentDay);
    if (found !== -1) {
      return found;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
})();

type SortDirection = "ASC" | "DESC";

function useFilterEvents(data: EventWithLiveStatus[], filters: Filters, sorting: Sorting) {
  const { sortBy, sortDirection } = sorting;
  const { day, languages, textFilter, fields } = filters;

  const dayFiltered = useMemo(() => data.filter(x => x.day === day), [data, day]);

  const finishedFiltered = useMemo(() => {
    if (filters.showFinished) {
      return dayFiltered;
    }
    return dayFiltered.filter(x => x.liveStatus !== LiveStatus.FINISHED);
  }, [dayFiltered, filters.showFinished]);

  const langFiltered = useMemo(() => finishedFiltered.filter(x =>
    (languages.en && x.language === "en") ||
    (languages.de && x.language === "de") ||
    (languages.other && x.language !== "de" && x.language !== "en")
  ), [finishedFiltered, languages]);

  const sessionTypeFiltered = useMemo(() => {
    const { sessionTypes } = filters;
    return langFiltered.filter(event => {
      const kind = event.type?.toLowerCase() || '';
      if (kind === 'official' && sessionTypes.official) return true;
      if (kind === 'assembly' && sessionTypes.assembly) return true;
      if (kind === 'sos' && sessionTypes.sos) return true;
      if (kind !== 'official' && kind !== 'assembly' && kind !== 'sos' && sessionTypes.other) return true;
      return false;
    });
  }, [langFiltered, filters.sessionTypes]);

  const textFiltered = useMemo(() => {
    if (!textFilter) return sessionTypeFiltered;
    const lowerF = textFilter.toLowerCase();
    return sessionTypeFiltered?.filter((event) => {
      for (const field of fields) {
        const z = event[field];
        const foundAnything = typeof z === "string" && z.toLowerCase().includes(lowerF);
        if (foundAnything) {
          return true;
        }
      }
      return false;
    });
  }, [sessionTypeFiltered, textFilter, fields]);

  const sorted = useMemo(() => {
    const sortedData = sortByFun(textFiltered, [sortBy]);
    if (sortDirection === "DESC") {
      return sortedData.reverse();
    }
    return sortedData;
  }, [textFiltered, sortBy, sortDirection]);

  return sorted;
}

function getLiveStatus(date: Date, event: ExtendedEvent): LiveStatus {
  const [hours = '0', minutes = '0'] = event.duration.split(':');
  const eventDate = new Date(event.date);
  const eventDateWithDuration = add(eventDate, { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) });
  const hasStarted = isAfter(date, eventDate);
  const isBeforeEndDate = isBefore(date, eventDateWithDuration);

  if (hasStarted && isBeforeEndDate) {
    return LiveStatus.LIVE;
  }
  if (hasStarted && !isBeforeEndDate) {
    return LiveStatus.FINISHED;
  }
  if (!hasStarted) {
    return LiveStatus.NOT_LIVE;
  }

  return LiveStatus.UNKNOWN;
}

const EventsList = ({
  schedule,
  selfOrganizedSchedule
}: {
  schedule: PresentableEvent,
  selfOrganizedSchedule: PresentableEvent
}) => {
  const [filters, setFilters] = useState<Filters>({
    day: foundDay || 0,
    languages: {
      en: true,
      de: false,
      other: true,
    },
    fields: ["room", "title", "date"],
    textFilter: "",
    sessionTypes: {
      official: true,
      assembly: true,
      sos: true,
      other: true,
    },
    showFinished: false
  });

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const [sorting, setSorting] = useState<Sorting>({
    sortBy: "date",
    sortDirection: "ASC",
  });

  const events = useMemo(() => [
    ...schedule.data,
    ...selfOrganizedSchedule.data
  ], [schedule, selfOrganizedSchedule]);

  const now = new Date();
  const acceptableTimeDrift = subMinutes(now, 5);
  const eventsWithLive = events.map(event => {
    if (!event.duration || !event.date) {
      return {
        ...event,
        liveStatus: LiveStatus.UNKNOWN
      };
    }
    return {
      ...event,
      liveStatus: getLiveStatus(acceptableTimeDrift, event)
    };
  });

  const renderableData = useFilterEvents(eventsWithLive, filters, sorting);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: renderableData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const handleSort = (field: TAvailableFields) => {
    if (sorting.sortBy === field) {
      setSorting({
        sortBy: field,
        sortDirection: sorting.sortDirection === "ASC" ? "DESC" : "ASC",
      });
    } else {
      setSorting({
        sortBy: field,
        sortDirection: "ASC",
      });
    }
  };

  const getCellValue = (event: EventWithLiveStatus, field: TAvailableFields): string => {
    if (field === "date") {
      return formatDate(event.date);
    }
    const value = event[field];
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
  };

  const getRowClassName = (event: EventWithLiveStatus) => {
    if (event.liveStatus === LiveStatus.UNKNOWN) {
      return "event-no-duration";
    }
    if (event.liveStatus === LiveStatus.LIVE) {
      return "event-live";
    }
    return "";
  };

  return (
    <>
      <ListFilters filters={filters} updateFilters={updateFilters} />
      <div className="TableContainer">
        <Paper elevation={3} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div className="VirtualTableHeader">
            {filters.fields.map((field) => (
              <div
                key={field}
                className="VirtualTableHeaderCell"
                onClick={() => handleSort(field)}
                style={{ cursor: "pointer" }}
              >
                {capitalize(field)}
                {sorting.sortBy === field && (
                  <span>{sorting.sortDirection === "ASC" ? " ▲" : " ▼"}</span>
                )}
              </div>
            ))}
          </div>

          {/* Virtualized Body */}
          <div
            ref={parentRef}
            className="VirtualTableBody"
            style={{
              height: "calc(100vh - 200px)",
              overflow: "auto",
            }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const event = renderableData[virtualRow.index];
                return (
                  <Link
                    key={virtualRow.key}
                    href={event.url || "#"}
                    target="_blank"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div className={`VirtualTableRow ${getRowClassName(event)}`}>
                      {filters.fields.map((field) => (
                        <div key={field} className="VirtualTableCell">
                          {getCellValue(event, field)}
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Paper>
      </div>
      <p>Schedule version: {schedule.version}</p>
      <p>Self organized schedule version: {selfOrganizedSchedule.version}</p>
    </>
  );
};

export default EventsList;
