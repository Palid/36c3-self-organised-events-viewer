"use client";

import capitalize from "lodash/capitalize";
import sortByFun from "lodash/sortBy";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import {
  AutoSizer,
  Column,
  SortDirection,
  Table,
  defaultTableRowRenderer,
} from "react-virtualized";
import {
  LiveStatus,
  ScheduleType,
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

const cellRenderer = (cell: {
  cellData: any;
  columnData: any;
  columnIndex: number;
  dataKey: string;
  isScrolling: boolean;
  rowData: any;
  rowIndex: number;
}) => {
  if (cell.dataKey === "date") {
    const l = DateTime.fromISO(cell.cellData);
    const { day, hour, minute } = l;
    const mapper = {
      27: "Day 1",
      28: "Day 2",
      29: "Day 3",
      30: "Day 4",
    };
    return `${mapper[day]}, ${day}.12 at ${hour
      .toString()
      .padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }
  return cell.cellData;
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

function useFilterEvents(data: EventWithLiveStatus[], filters: Filters, sorting: Sorting) {

  const { sortBy, sortDirection } = sorting;
  const { day, languages, textFilter, fields } = filters;

  const dayFiltered = useMemo(() => data.filter(x => x.day === day), [data, day])

  const finishedFiltered = useMemo(() => {
    if (filters.showFinished) {
      return dayFiltered
    }
    return dayFiltered.filter(x => x.liveStatus !== LiveStatus.FINISHED)
  }, [dayFiltered, filters.showFinished])

  const langFiltered = useMemo(() => finishedFiltered.filter(x => languages.en && x.language === "en" || languages.de && x.language === "de" || languages.other && x.language !== "de" && x.language !== "en"), [finishedFiltered, languages])

  const sessionTypeFiltered = useMemo(() => {
    if (filters.includeMainSessions && filters.includeSelfOrganized) {
      return langFiltered
    }
    if (filters.includeMainSessions && !filters.includeSelfOrganized) {
      return langFiltered.filter(x => x.category === ScheduleType.MAIN_EVENT)
    }
    if (!filters.includeMainSessions && filters.includeSelfOrganized) {
      return langFiltered.filter(x => x.category === ScheduleType.SELF_ORGANIZED_EVENT)
    }
  }, [langFiltered, filters.includeMainSessions, filters.includeSelfOrganized])

  const textFiltered = useMemo(() => {
    if (!textFilter) return sessionTypeFiltered
    const lowerF = textFilter.toLowerCase();
    return sessionTypeFiltered.filter((event) => {
      for (const field of fields) {
        const z = event[field];
        const foundAnything = typeof z === "string" && z.toLowerCase().includes(lowerF)
        if (foundAnything) {
          return true
        }
      }
      return false;
    })
  }, [sessionTypeFiltered, textFilter])

  const sorted = useMemo(() => {
    const sortedData = sortByFun(textFiltered, [sortBy])
    if (sortDirection === SortDirection.DESC) {
      return sortedData.reverse()
    }
    return sortedData
  }, [textFiltered, sortBy])

  return sorted;
}


function getLiveStatus(date: Date, event: ExtendedEvent): LiveStatus {
  const [hours = '0', minutes = '0'] = event.duration.split(':')
  const eventDate = new Date(event.date)
  const eventDateWithDuration = add(eventDate, { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) })
  const hasStarted = isAfter(date, eventDate)
  const isBeforeEndDate = isBefore(date, eventDateWithDuration)

  if (hasStarted && isBeforeEndDate) {
    return LiveStatus.LIVE
  }
  if (hasStarted && !isBeforeEndDate) {
    return LiveStatus.FINISHED
  }
  if (!hasStarted) {
    return LiveStatus.NOT_LIVE
  }

  return LiveStatus.UNKNOWN

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
    includeMainSessions: true,
    includeSelfOrganized: true,
    showFinished: false
  });

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const [sorting, setSorting] = useState<Sorting>({
    sortBy: "date",
    sortDirection: SortDirection.ASC,
  });

  const events = useMemo(() => [
    ...schedule.data,
    ...selfOrganizedSchedule.data
  ], [schedule, selfOrganizedSchedule])

  const now = new Date()
  const acceptableTimeDrift = subMinutes(now, 5)
  const eventsWithLive = events.map(event => {
    if (!event.duration || !event.date) {
      return {
        ...event,
        liveStatus: LiveStatus.UNKNOWN
      }
    }
    return {
      ...event,
      liveStatus: getLiveStatus(acceptableTimeDrift, event)
    }
  })

  const renderableData = useFilterEvents(eventsWithLive, filters, sorting);

  return (
    <>
      <ListFilters filters={filters} updateFilters={updateFilters} />
      <div className="TableContainer">
        <Paper elevation={3} style={{ flex: 1 }}>
          <AutoSizer>
            {({ width, height }) => (
              <Table
                width={width}
                height={height}
                rowHeight={52}
                headerHeight={56}
                rowGetter={({ index }) => renderableData[index]}
                rowCount={renderableData.length}
                rowRenderer={(props) => {
                  if (props.rowData.liveStatus === LiveStatus.UNKNOWN) {
                    props.className += ' event-no-duration'
                  } else if (props.rowData.liveStatus === LiveStatus.LIVE) {
                    props.className += ' event-live'
                  }

                  return (
                    <Link
                      href={props.rowData.url}
                      target="__blank"
                      color="inherit"
                    >
                      {defaultTableRowRenderer(props)}
                    </Link>
                  );

                }
                }
                sortBy={sorting.sortBy}
                sortDirection={sorting.sortDirection}
                sort={({ sortBy, sortDirection }) => {
                  setSorting({
                    sortBy: sortBy as TAvailableFields,
                    sortDirection,
                  });
                }}
              >
                {filters.fields.map((field) => (
                  <Column
                    key="field"
                    dataKey={field}
                    label={capitalize(field)}
                    width={50}
                    flexGrow={1}
                    cellRenderer={cellRenderer}
                  />
                ))}
              </Table>
            )}
          </AutoSizer>
        </Paper>
      </div>
      <p>Schedule version: {schedule.version}</p>
      <p>Self organized schedule version: {selfOrganizedSchedule.version}</p>
    </>
  );
};

export default EventsList;
