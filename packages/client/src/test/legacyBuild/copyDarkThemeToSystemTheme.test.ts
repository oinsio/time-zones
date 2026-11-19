// Verifies FR2, M4 of redesign-cards-grid-and-day-palettes.
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { copyDarkThemeToSystemTheme } from "../../../scripts/themeCss/copyDarkThemeToSystemTheme.mjs";

const run = async (css: string) =>
  (
    await postcss([copyDarkThemeToSystemTheme()]).process(css, {
      from: undefined,
    })
  ).css.replace(/\s+/g, " ");

const SOURCE = ':root{--a:#fff}:root[data-theme="dark"]{--a:#000}';

describe("copyDarkThemeToSystemTheme", () => {
  it("should add a system dark rule with the same declarations", async () => {
    expect(await run(SOURCE)).toContain(
      '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--a:#000}}',
    );
  });

  it("should leave the source rules unchanged", async () => {
    expect(await run(SOURCE)).toContain(
      ':root{--a:#fff}:root[data-theme="dark"]{--a:#000}',
    );
  });

  it("should leave CSS without a dark rule unchanged", async () => {
    expect(await run(":root{--a:#fff}")).toBe(":root{--a:#fff}");
  });
});
