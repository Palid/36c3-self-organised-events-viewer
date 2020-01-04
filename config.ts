export const CONFIG = {
  get domain() {
    return process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : `${window.location.origin}`;
  },

  get resource() {
    return "schedule";
  }
};
