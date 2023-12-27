"use client";

import React, { useState } from "react";
import {
  Column,
  Table,
  AutoSizer,
  SortDirection,
  defaultTableRowRenderer,
} from "react-virtualized";
import {
  RootObject,
  Event,
  Schedule,
  TAvailableFields,
  Filters,
  Sorting,
  ExtendedEvent,
} from "../types";
import { DateTime } from "luxon";
import capitalize from "lodash/capitalize";
import sortByFun from "lodash/sortBy";
import { ListFilters } from "./Filters";

import { Paper } from "@mui/material";
import Link from "next/link";

const prepareData = (
  filters: Filters,
  sorting: Sorting,
  data: ExtendedEvent[]
) => {
  const { day, languages, textFilter, fields } = filters;
  const { sortBy, sortDirection } = sorting;
  let preparedData = data;
  // Show only self organised
  // let preparedData = data.filter(x => x.track === "self organized sessions");
  preparedData = preparedData.filter((event) => event.day === day);
  preparedData = preparedData.filter((event) => {
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
    preparedData = preparedData.filter((event) => {
      for (const field of fields) {
        const z = event[field];
        if (typeof z === "string" && z.toLowerCase().includes(lowerF)) {
          return true;
        }
      }
    });
  }
  preparedData = sortByFun(preparedData, [sortBy]);
  if (sortDirection === SortDirection.DESC) {
    preparedData = preparedData.reverse();
  }
  return preparedData;
};

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
    return l.toFormat("dd, HH:mm");
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

const EventsList = ({ events }: { events: ExtendedEvent[] }) => {
  const [filters, setFilters] = useState<Filters>({
    day: foundDay || 0,
    languages: {
      en: true,
      de: false,
      other: false,
    },
    fields: ["room", "title", "date"],
    textFilter: "",
  });

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const [sorting, setSorting] = useState<Sorting>({
    sortBy: "date",
    sortDirection: SortDirection.ASC,
  });

  const { sortBy, sortDirection } = sorting;

  const renderableData = prepareData(filters, sorting, events);

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
                  return (
                    <Link
                      href={props.rowData.url}
                      target="__blank"
                      color="inherit"
                    >
                      {defaultTableRowRenderer(props)}
                    </Link>
                  );
                }}
                sortBy={sortBy}
                sortDirection={sortDirection}
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
        <style jsx>
          {`
            .TableContainer {
              display: flex;
              flex: 1;
              margin: 8px 0;
              min-height: calc(100vh - 72px - 24px);
            }
            @supports (-webkit-appearance: none) {
              .TableContainer {
                max-height: calc(100vh - 72px - 56px);
              }
            }
          `}
        </style>
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
              padding-right: 0 !important;
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
