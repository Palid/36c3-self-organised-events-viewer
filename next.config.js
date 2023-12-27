// const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Stuff necessary for storybook; we don't need it here, but I'm lazy.
  // experimental: {
  //   outputFileTracingRoot: path.join(__dirname, "./"),
  //   outputFileTracingExcludes: {
  //     "*": [
  //       "node_modules/@swc/core-linux-x64-musl",
  //       "node_modules/@swc/core-linux-x64-gnu",
  //       "node_modules/@esbuild",
  //       "node_modules/@storybook",
  //     ],
  //   },
  // },
};

module.exports = nextConfig;
