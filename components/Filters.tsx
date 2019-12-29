import React, { useState, useLayoutEffect } from "react";
import { Filters, TAvailableFields, AvailableFields } from "../types";
import {
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  FormGroup,
  RadioGroup,
  Select,
  Input,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import capitalize from "lodash/capitalize";

export const ListFilters = ({
  filters,
  updateFilters
}: {
  filters: Filters;
  updateFilters: (newFilters: Partial<Filters>) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    if (window && window.innerWidth && window.innerWidth >= 1024) {
      setExpanded(true);
    }
  }, []);

  const { languages, fields } = filters;
  return (
    <Card>
      <CardHeader
        title="Filters"
        action={
          <IconButton
            onClick={() => {
              setExpanded(!expanded);
            }}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <style jsx global>
            {`
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
              marginTop: -20,
              justifyContent: "space-between"
            }}
            className="FiltersForm"
          >
            <FormControl
              style={{
                flexDirection: "row"
              }}
            >
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
            </FormControl>

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
              label="Filter in visible fields"
              variant="outlined"
              onChange={e => {
                updateFilters({
                  textFilter: e.target.value
                });
              }}
            />
            <FormControl>
              <InputLabel id="demo-mutiple-name-label">Fields</InputLabel>
              <Select
                multiple={true}
                value={filters.fields}
                input={<Input />}
                onChange={e => {
                  const value = e.target.value as TAvailableFields[];
                  updateFilters({
                    fields: value
                  });
                }}
              >
                {AvailableFields.map(x => (
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
