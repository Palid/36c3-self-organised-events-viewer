import React, { useState, useEffect } from "react";
import { Column, Table } from "react-virtualized";
import { RootObject } from "../types";

const parseData = () => {

}


const EventsList = () => {
  const [data, setData] = useState<RootObject>();

  useEffect(() => {
    fetch("http://data.c3voc.de/36C3/everything.schedule.json")
      .then(x => x.json())
      .then((x: RootObject) => setData(x));
  });

  return <Table>

	</Table>;
};
