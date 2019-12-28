export const CONFIG = {
  domain:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "https://c3sessions.bgp.wtf/",
  resource: "schedule"
};
