import React, { useEffect } from "react";
import Head from "next/head";

import EventsList from "../components/EventsList";
import { Container } from "@material-ui/core";

const Home = () => {
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);
  return (
    <>
      <Head>
        <title>36C3 self-organised sessions finder</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Condensed&display=swap"
          rel="stylesheet"
        />
        >
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
        />
      </Head>
      <div>
        <Container style={{ paddingTop: 8, maxWidth: "100%" }}>
          <EventsList />
        </Container>
      </div>
      <style jsx global>
        {`
        body {
          font-family: "Roboto", sans-serif;
					margin: 0;
					padding 0;
        }
      `}
      </style>
    </>
  );
};

export default Home;
