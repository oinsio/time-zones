// @add-zone-rules-from-iana @FR2 @NFR-P2: shared setup of the zone rules plugin tests
import { readFileSync } from "node:fs";
import { ZONE_RULES_RELEASE_FILE } from "../../../app.config.ts";
import { zoneRulesPlugin } from "../../../scripts/zoneRules/zoneRulesPlugin.ts";

export const BASE = "/time-zones/";
export const RESOLVED_URL_ID = "\0virtual:zone-rules-url";
export const RESOLVED_RULES_ID = "\0virtual:zone-rules";
export const RELEASE_TEXT = readFileSync(ZONE_RULES_RELEASE_FILE, "utf8");

export type Hook = (this: unknown, ...args: unknown[]) => unknown;

export function createPlugin(command: "build" | "serve", mode = "production") {
  const plugin = zoneRulesPlugin();
  (plugin.configResolved as Hook)({
    command,
    mode,
    base: BASE,
    root: process.cwd(),
  });
  const call = (hook: unknown, context: unknown, ...args: unknown[]) =>
    (hook as Hook).call(context, ...args);
  return { plugin, call };
}
