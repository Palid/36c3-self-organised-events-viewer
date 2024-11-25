import { useLayoutEffect, useState } from "react";
import { AvailableFields, type Filters, type TAvailableFields } from "../types";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material";
import capitalize from "lodash/capitalize";

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
