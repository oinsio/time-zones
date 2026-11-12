// @add-zone-rules-from-iana @FR2 @NFR-P2: the Vite plugin serving the zone rules
import { describe, expect, it, vi } from "vitest";
import type { zoneRulesPlugin } from "../../../scripts/zoneRules/zoneRulesPlugin.ts";
import {
  createPlugin,
  RELEASE_TEXT,
  RESOLVED_RULES_ID,
  RESOLVED_URL_ID,
} from "./zoneRulesPluginWorld";

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

describe("edge cases of the hooks", () => {
  const html = "<html><head></head></html>";
  const getHandler = (plugin: ReturnType<typeof zoneRulesPlugin>) =>
    (plugin.transformIndexHtml as { handler: unknown }).handler;

  it("passes a request without a url on", () => {
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
    handlers[0]?.({}, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("adds nothing when the build has no bundle", () => {
    const { plugin, call } = createPlugin("build");
    expect(call(getHandler(plugin), {}, html, {})).toBe(html);
  });

  it("skips outputs without names", () => {
    const { plugin, call } = createPlugin("build");
    const transformed = call(getHandler(plugin), {}, html, {
      bundle: { "main.js": { type: "chunk", fileName: "main.js" } },
    });
    expect(transformed).toBe(html);
  });

  it("serves the rules module only for its own resolved id", () => {
    const { plugin, call } = createPlugin("serve", "test");
    expect(call(plugin.load, {}, RESOLVED_URL_ID)).toContain(
      "/time-zones/zone-rules.json",
    );
    expect(call(plugin.load, {}, "\0virtual:other")).toBeUndefined();
  });

  it("holds the release text without trailing whitespace before the semicolon", () => {
    const { plugin, call } = createPlugin("serve", "test");
    expect(call(plugin.load, {}, RESOLVED_RULES_ID)).toBe(
      `export default ${RELEASE_TEXT.trim()};`,
    );
  });
});
