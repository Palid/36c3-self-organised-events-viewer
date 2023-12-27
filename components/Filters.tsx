import React, { useState, useLayoutEffect } from "react";
import { Filters, TAvailableFields, AvailableFields } from "../types";

import capitalize from "lodash/capitalize";
import {
  Card,
  CardHeader,
  IconButton,
  Collapse,
  CardContent,
  FormGroup,
  FormControl,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  InputLabel,
  Select,
  Input,
  MenuItem,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

export const ListFilters = ({
  filters,
  updateFilters,
}: {
  filters: Filters;
  updateFilters: (newFilters: Partial<Filters>) => void;
}) => {
  const [expanded, setExpanded] = useState<boolean | undefined>(undefined);

  useLayoutEffect(() => {
    if (window && window.innerWidth && window.innerWidth >= 1024) {
      if (typeof expanded === "undefined") {
        setExpanded(true);
      }
    }
  }, [expanded]);

  const { languages, fields } = filters;
  return (
    <Card>
      <CardHeader
        title="Filters"
        action={
          <IconButton
            onClick={() => {
              const newValue = !expanded;
              setExpanded(newValue);
            }}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout={300}>
        <CardContent>
          <style jsx global>
            {`
              .MuiCardHeader-root {
                padding: 0 16px;
              }
              .MuiFormControl-root {
                margin: 0 4px;
              }
            `}
          </style>
          <FormGroup
            row
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "space-between",
            }}
            className="FiltersForm"
          >
            <FormControl
              style={{
                flexDirection: "row",
              }}
            >
              <FormControlLabel
                label="English"
                control={
                  <Checkbox
                    id="lang_en"
                    checked={languages.en}
                    onChange={(e) => {
                      updateFilters({
                        languages: {
                          ...languages,
                          en: e.target.checked,
                        },
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
                    onChange={(e) => {
                      updateFilters({
                        languages: {
                          ...languages,
                          de: e.target.checked,
                        },
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
                    onChange={(e) => {
                      updateFilters({
                        languages: {
                          ...languages,
                          other: e.target.checked,
                        },
                      });
                    }}
                  />
                }
              />
            </FormControl>

            <RadioGroup
              style={{
                flexDirection: "row",
              }}
              aria-label="Chosen day"
              name="day"
              value={filters.day}
              onChange={(e) => {
                updateFilters({
                  day: parseInt(e.target.value, 10),
                });
              }}
            >
              {["day1", "day2", "day3", "day4"].map((x, y) => {
                const k = `${27 + y}.12 - Day ${y + 1}`;
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
              label="Filter in visible fields"
              variant="outlined"
              onChange={(e) => {
                updateFilters({
                  textFilter: e.target.value,
                });
              }}
            />
            <FormControl>
              <InputLabel id="demo-mutiple-name-label">Fields</InputLabel>
              <Select
                multiple={true}
                value={filters.fields}
                input={<Input />}
                onChange={(e) => {
                  const value = e.target.value as TAvailableFields[];
                  updateFilters({
                    fields: value,
                  });
                }}
              >
                {AvailableFields.map((x) => (
                  <MenuItem value={x} key={x}>
                    {capitalize(x)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormGroup>
        </CardContent>
      </Collapse>
    </Card>
  );
};
