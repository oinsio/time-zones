// Verifies FR18, NFR-P1 of add-unix-time-converter-tool: the converter texts exist in every language and load on demand.
import { createInstance } from "i18next";
import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from ".";
import { loadUnixTimeLocales } from "./unixTimeLocales";

const bundleModules: Record<string, Record<string, unknown>> = import.meta.glob(
  "./unixTime/*.json",
  { eager: true, import: "default" },
);

const collectKeys = (node: Record<string, unknown>, parent = ""): string[] =>
  Object.entries(node).flatMap(([key, child]) =>
    typeof child === "object" && child !== null
      ? collectKeys(child as Record<string, unknown>, `${parent}${key}.`)
      : [`${parent}${key}`],
  );

describe("the Unix time converter locale files", () => {
  it("should have one file per supported language", () => {
    const codes = Object.keys(bundleModules).map(
      (path) => /unixTime\/(.+)\.json$/.exec(path)?.[1],
    );
    expect(codes.sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
  });

  it("should share one set of keys", () => {
    const keySets = Object.values(bundleModules).map((bundle) =>
      collectKeys(bundle).sort(),
    );
    for (const keys of keySets) expect(keys).toEqual(keySets[0]);
  });

  it("should hold no empty text", () => {
    for (const bundle of Object.values(bundleModules)) {
      for (const text of Object.values(bundle)) expect(text).not.toBe("");
    }
  });
});

describe("loadUnixTimeLocales", () => {
  it("should add the texts of every language to the instance", async () => {
    const instance = createInstance();
    await instance.init({
      lng: "ru",
      resources: { ru: { translation: {} }, en: { translation: {} } },
    });
    expect(instance.t("unixTime.now")).toBe("unixTime.now");
    await loadUnixTimeLocales(instance);
    expect(instance.t("unixTime.now")).toBe("Сейчас");
    expect(instance.getFixedT("en")("unixTime.now")).toBe("Now");
  });

  it("should keep the texts the instance already had", async () => {
    const instance = createInstance();
    await instance.init({
      lng: "ru",
      resources: { ru: { translation: { app: { title: "Часовые пояса" } } } },
    });
    await loadUnixTimeLocales(instance);
    expect(instance.t("app.title")).toBe("Часовые пояса");
  });
});
