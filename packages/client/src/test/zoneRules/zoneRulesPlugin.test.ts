// @add-zone-rules-from-iana @FR2 @NFR-P2: the Vite plugin serving the zone rules
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { ZONE_RULES_RELEASE_FILE } from "../../../app.config.ts";
import { zoneRulesPlugin } from "../../../scripts/zoneRules/zoneRulesPlugin.ts";

const BASE = "/time-zones/";
const RESOLVED_URL_ID = "\0virtual:zone-rules-url";
const RESOLVED_RULES_ID = "\0virtual:zone-rules";
const RELEASE_TEXT = readFileSync(ZONE_RULES_RELEASE_FILE, "utf8");

type Hook = (this: unknown, ...args: unknown[]) => unknown;

function createPlugin(command: "build" | "serve", mode = "production") {
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

describe("virtual:zone-rules", () => {
  it("holds the release and the zones of the committed file in test mode", () => {
    const { plugin, call } = createPlugin("serve", "test");
    expect(call(plugin.resolveId, {}, "virtual:zone-rules")).toBe(
      RESOLVED_RULES_ID,
    );
    const source = call(plugin.load, {}, RESOLVED_RULES_ID) as string;
    const document = JSON.parse(
      source.replace(/^export default /, "").replace(/;$/, ""),
    );
    expect(document.release).toBe("2026f");
    expect(Object.keys(document.zones).length).toBeGreaterThan(500);
  });

  it("is not resolved outside test mode", () => {
    const { plugin, call } = createPlugin("build");
    expect(call(plugin.resolveId, {}, "virtual:zone-rules")).toBeUndefined();
  });
});

describe("virtual:zone-rules-url", () => {
  it("in a build emits one asset named zone-rules.json with the file's content", () => {
    const { plugin, call } = createPlugin("build");
    const emitFile = vi.fn(() => "ref123");
    expect(call(plugin.resolveId, {}, "virtual:zone-rules-url")).toBe(
      RESOLVED_URL_ID,
    );
    const source = call(plugin.load, { emitFile }, RESOLVED_URL_ID);
    expect(emitFile).toHaveBeenCalledTimes(1);
    expect(emitFile).toHaveBeenCalledWith({
      type: "asset",
      name: "zone-rules.json",
      source: RELEASE_TEXT,
    });
    expect(source).toBe("export default import.meta.ROLLUP_FILE_URL_ref123;");
  });

  it("when serving returns the path of the dev middleware", () => {
    const { plugin, call } = createPlugin("serve");
    const emitFile = vi.fn();
    expect(call(plugin.load, { emitFile }, RESOLVED_URL_ID)).toBe(
      `export default ${JSON.stringify("/time-zones/zone-rules.json")};`,
    );
    expect(emitFile).not.toHaveBeenCalled();
  });

  it("is answered by the dev middleware with the file as application/json", () => {
    const { plugin, call } = createPlugin("serve");
    const handlers: Array<
      (request: unknown, response: unknown, next: () => void) => void
    > = [];
    call(
      plugin.configureServer,
      {},
      { middlewares: { use: (handler: never) => handlers.push(handler) } },
    );
    const headers = new Map<string, string>();
    const response = {
      setHeader: (name: string, value: string) => headers.set(name, value),
      end: vi.fn(),
    };
    const next = vi.fn();
    handlers[0]?.({ url: "/time-zones/zone-rules.json?t=1" }, response, next);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(response.end).toHaveBeenCalledWith(RELEASE_TEXT);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes other requests on", () => {
    const { plugin, call } = createPlugin("serve");
    const handlers: Array<
      (request: unknown, response: unknown, next: () => void) => void
    > = [];
    call(
      plugin.configureServer,
      {},
      { middlewares: { use: (handler: never) => handlers.push(handler) } },
    );
    const next = vi.fn();
    handlers[0]?.({ url: "/time-zones/other.json" }, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("the preload link", () => {
  const html = "<html><head></head></html>";

  it("points at the hashed asset of a build", () => {
    const { plugin, call } = createPlugin("build");
    const transformed = call(
      (plugin.transformIndexHtml as { handler: unknown }).handler,
      {},
      html,
      {
        bundle: {
          "assets/zone-rules-abc.json": {
            type: "asset",
            fileName: "assets/zone-rules-abc.json",
            names: ["zone-rules.json"],
          },
        },
      },
    ) as string;
    expect(transformed).toContain(
      'href="/time-zones/assets/zone-rules-abc.json"',
    );
  });

  it("points at the dev path when serving", () => {
    const { plugin, call } = createPlugin("serve");
    const transformed = call(
      (plugin.transformIndexHtml as { handler: unknown }).handler,
      {},
      html,
      {},
    ) as string;
    expect(transformed).toContain('href="/time-zones/zone-rules.json"');
  });

  it("adds nothing when the build holds no zone rules asset", () => {
    const { plugin, call } = createPlugin("build");
    const transformed = call(
      (plugin.transformIndexHtml as { handler: unknown }).handler,
      {},
      html,
      { bundle: {} },
    );
    expect(transformed).toBe(html);
  });
});

describe("other ids", () => {
  it.each(["virtual:zone-cities", "virtual:zone-rules-other", "./zone-rules"])(
    "does not resolve %s",
    (id) => {
      const { plugin, call } = createPlugin("build");
      expect(call(plugin.resolveId, {}, id)).toBeUndefined();
      expect(call(plugin.load, {}, `\0${id}`)).toBeUndefined();
    },
  );
});
