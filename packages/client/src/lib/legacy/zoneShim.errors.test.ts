// FR4 of support-legacy-ios-12-safari: the shim rethrows what it cannot repair.
import { describe, expect, it } from "vitest";
import { createLegacyZoneDateTimeFormat } from "./zoneShim";

const RENAMED_ZONE_ID = "Europe/Kyiv";
const LEGACY_NAMES = { [RENAMED_ZONE_ID]: ["Europe/Kiev"] };

/** A native stand-in whose constructor runs `onConstruct` and records calls. */
function createScriptedNative(
  onConstruct: (options: Intl.DateTimeFormatOptions | undefined) => void,
) {
  const constructedWith: (Intl.DateTimeFormatOptions | undefined)[] = [];
  function ScriptedNative(
    _locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    constructedWith.push(options);
    onConstruct(options);
    return { scripted: true };
  }
  return {
    constructedWith,
    nativeConstructor: ScriptedNative as unknown as typeof Intl.DateTimeFormat,
  };
}

describe("createLegacyZoneDateTimeFormat error handling", () => {
  it("should rethrow a TypeError of the first attempt without retrying", () => {
    const { nativeConstructor, constructedWith } = createScriptedNative(() => {
      throw new TypeError("broken");
    });
    const shim = createLegacyZoneDateTimeFormat(
      nativeConstructor,
      LEGACY_NAMES,
    );

    expect(() => new shim("en", { timeZone: RENAMED_ZONE_ID })).toThrow(
      TypeError,
    );
    expect(constructedWith).toHaveLength(1);
  });

  it("should rethrow the RangeError when the call has no options", () => {
    const { nativeConstructor } = createScriptedNative(() => {
      throw new RangeError("bad locale");
    });
    const shim = createLegacyZoneDateTimeFormat(
      nativeConstructor,
      LEGACY_NAMES,
    );

    expect(() => new shim("xx")).toThrow(RangeError);
  });

  it("should rethrow the RangeError when the options have no time zone", () => {
    const { nativeConstructor } = createScriptedNative(() => {
      throw new RangeError("bad option");
    });
    const shim = createLegacyZoneDateTimeFormat(
      nativeConstructor,
      LEGACY_NAMES,
    );

    expect(() => new shim("en", { hour: "numeric" })).toThrow(RangeError);
  });

  it("should not retry a zone without legacy names", () => {
    const { nativeConstructor, constructedWith } = createScriptedNative(
      (options) => {
        if (options?.timeZone === "Mars/Olympus") throw new RangeError("zone");
      },
    );
    const shim = createLegacyZoneDateTimeFormat(
      nativeConstructor,
      LEGACY_NAMES,
    );

    expect(() => new shim("en", { timeZone: "Mars/Olympus" })).toThrow(
      RangeError,
    );
    expect(constructedWith).toHaveLength(1);
  });

  it("should rethrow a TypeError raised while trying a legacy name", () => {
    const { nativeConstructor } = createScriptedNative((options) => {
      if (options?.timeZone === RENAMED_ZONE_ID) throw new RangeError("zone");
      throw new TypeError("legacy attempt broke");
    });
    const shim = createLegacyZoneDateTimeFormat(
      nativeConstructor,
      LEGACY_NAMES,
    );

    expect(() => new shim("en", { timeZone: RENAMED_ZONE_ID })).toThrow(
      TypeError,
    );
  });
});
