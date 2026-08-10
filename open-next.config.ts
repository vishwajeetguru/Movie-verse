import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// `buildCommand` tells OpenNext's build how to compile the Next.js app itself.
// It must live at the TOP level of the config (defineCloudflareConfig only
// forwards its own whitelisted options). Without it OpenNext runs
// `npm run build`, which would recurse when the platform executes
// `npm run build` -> `opennextjs-cloudflare build` -> `npm run build` ...
// See https://opennext.js.org/cloudflare/caching to enable R2 cache storage.
export default {
  ...defineCloudflareConfig(),
  buildCommand: "next build",
};