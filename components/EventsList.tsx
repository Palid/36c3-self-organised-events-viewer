import React, { useState, useEffect, useRef } from "react";
import {
  Column,
  Table,
  AutoSizer,
  SortDirection,
  SortDirectionType
} from "react-virtualized";
import { RootObject, Event, Schedule } from "../types";
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

interface EventWithRoom extends Event {
  room: string;
}

const parseData = (schedule: Schedule, day: number): EventWithRoom[] => {
  debugger;
  const rooms = schedule.conference.days[day].rooms;
  const data = [];
  for (const room in rooms) {
    const events = rooms[room];
    for (const eventName in events) {
      const event = events[eventName];
      data.push({ ...event, room });
    }
  }
  return data;
};

type Language = "en" | "de" | "";

const EventsList = () => {
  const [data, setData] = useState<RootObject>();
  const [day, setDay] = useState<number>(0);
  const [renderableData, setRenderableData] = useState<Event[]>([]);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<SortDirectionType>(
    SortDirection.ASC
  );
  const [filter, setFilter] = useState<string>("");
  const [language, setLanguage] = useState({
    english: true,
    german: false,
    other: false
  });

  const prepareData = (data: RootObject) => {
    let preparedData = parseData(data.schedule, day);
    preparedData = lodash.sortBy(preparedData, [sortBy]);
    preparedData = preparedData.filter(event => {
      if (language.english && event.language === "en") {
        return true;
      } else if (language.german && event.language === "de") {
        return true;
      } else if (
        language.other &&
        event.language !== "de" &&
        event.language !== "en"
      ) {
        return true;
      }
    });
    if (filter) {
      const lowerF = filter.toLowerCase();
      preparedData = preparedData.filter(
        event =>
          event.title.toLowerCase().includes(lowerF) ||
          event.subtitle.toLowerCase().includes(lowerF) ||
          event.room.toLowerCase().includes(lowerF)
      );
    }
    if (sortDirection === SortDirection.DESC) {
      preparedData = preparedData.reverse();
    }
    setRenderableData(preparedData);
  };

  useEffect(() => {
    if (!data) {
      fetch("http://localhost:3001/schedule")
        .then(x => x.json())
        .then((x: RootObject) => {
          setData(x);
          prepareData(x);
        });
    }
  });

  useEffect(() => {
    if (data) {
      prepareData(data);
    }
  }, [day, sortBy, sortDirection, filter, language]);

  return (
    <>
      <FormGroup row style={{ display: "flex", flex: 1, paddingTop: 24 }}>
        <FormControlLabel
          label="English"
          control={
            <Checkbox
              id="lang_en"
              checked={language.english}
              onChange={e => {
                setLanguage({
                  ...language,
                  english: e.target.checked
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
              checked={language.german}
              onChange={e => {
                setLanguage({
                  ...language,
                  german: e.target.checked
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
              checked={language.other}
              onChange={e => {
                setLanguage({
                  ...language,
                  other: e.target.checked
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
          value={day}
          onChange={e => {
            setDay(parseInt(e.target.value, 10));
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
            setFilter(e.target.value);
          }}
        />
      </FormGroup>
      <div
        style={{
          minHeight: "calc(100vh - 48px - 56px)",
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
                setSortBy(sortBy);
                setSortDirection(sortDirection);
              }}
            >
              <Column dataKey="room" label="Room" width={50} flexGrow={1} />

              <Column dataKey="title" label="Title" width={100} flexGrow={1} />
              <Column
                dataKey="subtitle"
                label="Subtitle"
                width={200}
                flexGrow={1}
              />
              <Column
                dataKey="date"
                width={50}
                label="Date"
                flexGrow={1}
                cellRenderer={({ cellData }) => {
                  const l = DateTime.fromISO(cellData);
                  return l.toLocaleString(DateTime.DATETIME_SHORT);
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
