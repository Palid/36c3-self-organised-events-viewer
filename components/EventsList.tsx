import React, { useState, useEffect, useRef } from "react";
import {
  Column,
  Table,
  AutoSizer,
  SortDirection,
  SortDirectionType
} from "react-virtualized";
import { RootObject, Event, Schedule, Language } from "../types";
import { DateTime } from "luxon";
import lodash from "lodash";
import {
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  FormGroup,
  RadioGroup
} from "@material-ui/core";

import { CONFIG } from "../config";

interface ExtendedEvent extends Event {
  room: string;
  day: number;
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

type AvailableFields = keyof Event;
type Filters = {
  day: number;
  fields: AvailableFields[];
  textFilter: string;
  languages: {
    [key in Language]: boolean;
  };
};

type Sorting = {
  sortBy: AvailableFields;
  sortDirection: SortDirectionType;
};

const prepareData = (
  filters: Filters,
  sorting: Sorting,
  data: ExtendedEvent[]
) => {
  const { day, languages, textFilter } = filters;
  const { sortBy, sortDirection } = sorting;
  let preparedData = data;
  // Show only self organised
  // let preparedData = data.filter(x => x.track === "self organized sessions");
  preparedData = preparedData.filter(event => event.day === day);
  preparedData = preparedData.filter(event => {
    if (languages.en && event.language === "en") {
      return true;
    } else if (languages.de && event.language === "de") {
      return true;
    } else if (
      languages.other &&
      event.language !== "de" &&
      event.language !== "en"
    ) {
      return true;
    }
  });
  if (textFilter) {
    const lowerF = textFilter.toLowerCase();
    preparedData = preparedData.filter(
      event =>
        event.title.toLowerCase().includes(lowerF) ||
        event.subtitle.toLowerCase().includes(lowerF) ||
        event.room.toLowerCase().includes(lowerF)
    );
  }
  preparedData = lodash.sortBy(preparedData, [sortBy]);
  if (sortDirection === SortDirection.DESC) {
    preparedData = preparedData.reverse();
  }
  return preparedData;
};

const EventsList = () => {
  const [data, setData] = useState<ExtendedEvent[]>([]);

  useEffect(() => {
    if (data.length === 0) {
      fetch(`${CONFIG.domain}/${CONFIG.resource}`)
        .then(x => x.json())
        .then((x: RootObject) => {
          const parsed = parseData(x.schedule);
          setData(parsed);
        });
    }
  });

  const [filters, setFilters] = useState<Filters>({
    day: 0,
    languages: {
      en: true,
      de: false,
      other: false
    },
    fields: ["room", "title", "date"],
    textFilter: ""
  });

  const { day, languages, fields, textFilter } = filters;

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const [sorting, setSorting] = useState<Sorting>({
    sortBy: "date",
    sortDirection: SortDirection.ASC
  });

  const { sortBy, sortDirection } = sorting;

  const renderableData = prepareData(filters, sorting, data);

  return (
    <>
      <FormGroup row style={{ display: "flex", flex: 1, paddingTop: 24 }}>
        <FormControlLabel
          label="English"
          control={
            <Checkbox
              id="lang_en"
              checked={languages.en}
              onChange={e => {
                updateFilters({
                  languages: {
                    ...languages,
                    en: e.target.checked
                  }
                });
              }}
            />
          }
        />
        <FormControlLabel
          label="German"
          control={
            <Checkbox
              id="lang_de"
              checked={languages.de}
              onChange={e => {
                updateFilters({
                  languages: {
                    ...languages,
                    de: e.target.checked
                  }
                });
              }}
            />
          }
        />

        <FormControlLabel
          label="Other"
          control={
            <Checkbox
              id="lang_other"
              checked={languages.other}
              onChange={e => {
                updateFilters({
                  languages: {
                    ...languages,
                    other: e.target.checked
                  }
                });
              }}
            />
          }
        />

        <RadioGroup
          style={{
            flexDirection: "row"
          }}
          aria-label="Chosen day"
          name="day"
          value={filters.day}
          onChange={e => {
            updateFilters({
              day: parseInt(e.target.value, 10)
            });
          }}
        >
          {["day1", "day2", "day3", "day4"].map((x, y) => {
            const k = `Day ${y + 1}`;
            return (
              <FormControlLabel
                key={k}
                label={k}
                value={y}
                control={<Radio />}
              />
            );
          })}
        </RadioGroup>
        <TextField
          id="filter"
          label="Filter"
          variant="outlined"
          onChange={e => {
            updateFilters({
              textFilter: e.target.value
            });
          }}
        />
      </FormGroup>
      <div
        style={{
          minHeight:
            globalThis && globalThis.outerWidth < 920
              ? "calc(100vh - 188px)"
              : "calc(100vh - 48px - 56px)",
          display: "flex",
          flex: 1,
          paddingBottom: 24
        }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <Table
              width={width}
              height={height}
              rowHeight={52}
              headerHeight={56}
              rowGetter={({ index }) => renderableData[index]}
              rowCount={renderableData.length}
              onRowClick={({ rowData }) => {
                window.open(rowData.url, "_blank");
              }}
              sortBy={sortBy}
              sortDirection={sortDirection}
              sort={({ sortBy, sortDirection }) => {
                setSorting({
                  sortBy: sortBy as AvailableFields,
                  sortDirection
                });
              }}
            >
              <Column dataKey="room" label="Room" width={50} flexGrow={1} />

              <Column dataKey="title" label="Title" width={100} flexGrow={1} />
              {globalThis && globalThis.outerWidth >= 1024 && (
                <Column dataKey="subtitle" label="Subtitle" width={200} />
              )}
              <Column
                dataKey="date"
                width={70}
                label="Date"
                cellRenderer={({ cellData }) => {
                  const l = DateTime.fromISO(cellData);
                  return l.toFormat("dd, HH:mm");
                }}
              />
            </Table>
          )}
        </AutoSizer>
        <style jsx global>
          {`
            .ReactVirtualized__Table {
              font-family: "Roboto Condensed", sans-serif;
              font-size: 14;
              background-color: #fff;
            }
            .ReactVirtualized__Table__row {
              display: flex;
              align-items: center;
              flex-direction: row;
              border-bottom: 1px solid rgba(60, 60, 70, 0.12);
            }
            .ReactVirtualized__Table__headerRow {
              display: flex;
              align-items: center;
              flex-direction: row;
              border-bottom: 1px solid rgba(60, 60, 70, 0.12);
            }
            .ReactVirtualized__Table__rowColumn {
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
              padding-left: 8px;
              padding-right: 8px;
            }
            .ReactVirtualized__Table__headerColumn {
              display: inline-block;
              padding: 0 10px;
              overflow: hidden;
              max-width: 100%;
              font-weight: bold;
            }
            .ReactVirtualized__Table__headerTruncatedText {
              display: inline-block;
              max-width: 100%;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
          `}
        </style>
      </div>
    </>
  );
};

export default EventsList;
