// @add-zone-rules-from-iana @FR2 @NFR-P2: the Vite plugin serving the zone rules
import { describe, expect, it, vi } from "vitest";
import {
  createPlugin,
  RELEASE_TEXT,
  RESOLVED_RULES_ID,
  RESOLVED_URL_ID,
} from "./zoneRulesPluginWorld";

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
