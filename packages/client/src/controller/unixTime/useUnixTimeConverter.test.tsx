// Verifies FR9, FR10, FR11, FR12, FR14, FR16, NFR-P2 of add-unix-time-converter-tool.
import { act, renderHook } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
  createInMemoryTextCopying,
} from "@/adapters";
import { ReferenceMode } from "@/model";
import { createConverterState, UnixTimeUnitChoice } from "@/model/unixTime";
import { CopyOutcome, LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import type { ToolSession } from "@/tools";
import { LocationsProvider } from "../LocationsProvider";
import { LocationsContext } from "../locationsContext";
import { WallTimeInputOutcome } from "../useWallTimeInput";
import { useUnixTimeConverter } from "./useUnixTimeConverter";

const almaty = buildLocation({ label: "Almaty", ...KNOWN_CITIES.Almaty });
const moscow = buildLocation({ label: "Moscow", ...KNOWN_CITIES.Moscow });

/** Holds every scheduled tick (the second tick and the minute tick) until the test runs them. */
function createCollectingTickScheduler() {
  const pending = new Set<() => void>();
  return {
    schedule: (callback: () => void) => {
      pending.add(callback);
      return () => {
        pending.delete(callback);
      };
    },
    hasPending: () => pending.size > 0,
    runPending: () => {
      const callbacks = [...pending];
      pending.clear();
      for (const callback of callbacks) callback();
    },
  };
}

function setup(kept: unknown = undefined) {
  const clock = createSwitchableClock("2026-11-23T11:23:07Z", "Asia/Almaty");
  const tickScheduler = createCollectingTickScheduler();
  const textCopying = createInMemoryTextCopying();
  const onLeave = vi.fn();
  const written: unknown[] = [];
  const session: ToolSession = {
    read: () => kept,
    write: (value) => written.push(value),
  };
  const backend = createInMemoryLocationBackend({
    status: LocationsLoadStatus.LOADED,
    locations: [almaty, moscow],
    homeLocationId: almaty.id,
  });
  const rendered = renderHook(
    () => ({
      tool: useUnixTimeConverter({
        session,
        tickScheduler,
        textCopying,
        onLeave,
      }),
      store: useContext(LocationsContext)?.store,
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={createInMemoryLocationRepository({ backend })}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  const moscowTime = () =>
    rendered.result.current.tool.converter.rows.find(
      ({ id }) => id === moscow.id,
    )?.timeLabel;
  return {
    clock,
    tickScheduler,
    textCopying,
    onLeave,
    written,
    rendered,
    moscowTime,
  };
}

describe("useUnixTimeConverter", () => {
  it("should open live at the current second", () => {
    const { rendered, moscowTime } = setup();
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795432987",
    );
    expect(moscowTime()).toBe("14:23:07");
  });

  it("should follow the clock every second while live", () => {
    const { rendered, clock, tickScheduler, moscowTime } = setup();
    clock.moveTo("2026-11-23T11:23:08Z", "Asia/Almaty");
    act(() => tickScheduler.runPending());
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795432988",
    );
    expect(moscowTime()).toBe("14:23:08");
  });

  it("should stop ticking once pinned and tick again after Now", () => {
    const { rendered, tickScheduler, clock } = setup();
    act(() => rendered.result.current.tool.commands.typeInput("1700000000"));
    expect(tickScheduler.hasPending()).toBe(true); // only the minute tick
    clock.moveTo("2026-11-23T11:23:09Z", "Asia/Almaty");
    act(() => tickScheduler.runPending());
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1700000000",
    );
    expect(rendered.result.current.tool.converter.isNowActive).toBe(true);
    act(() => rendered.result.current.tool.commands.returnToNow());
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795432989",
    );
    expect(rendered.result.current.tool.converter.isNowActive).toBe(false);
  });

  it("should change the unit and keep the live moment", () => {
    const { rendered } = setup();
    act(() =>
      rendered.result.current.tool.commands.chooseUnit(
        UnixTimeUnitChoice.MILLISECONDS,
      ),
    );
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795432987000",
    );
  });

  it("should set the moment from a typed row time and refuse an unreadable one", () => {
    const { rendered, moscowTime } = setup();
    let outcome: WallTimeInputOutcome | undefined;
    act(() => {
      outcome = rendered.result.current.tool.commands.setRowWallTime(
        moscow.id,
        "9:30:15.5",
      );
    });
    expect(outcome).toBe(WallTimeInputOutcome.CLOSED);
    expect(moscowTime()).toBe("09:30:15.500");
    act(() => {
      outcome = rendered.result.current.tool.commands.setRowWallTime(
        moscow.id,
        "abc",
      );
    });
    expect(outcome).toBe(WallTimeInputOutcome.INVALID_TEXT);
    expect(moscowTime()).toBe("09:30:15.500");
  });

  it("should refuse a row time of an unknown row", () => {
    const { rendered } = setup();
    let outcome: WallTimeInputOutcome | undefined;
    act(() => {
      outcome = rendered.result.current.tool.commands.setRowWallTime(
        "nope",
        "9:30",
      );
    });
    expect(outcome).toBe(WallTimeInputOutcome.INVALID_TEXT);
  });

  it("should move the moment to a chosen day of a row and ignore an unknown row", () => {
    const { rendered } = setup();
    act(() => rendered.result.current.tool.commands.typeInput("1795432987123"));
    act(() =>
      rendered.result.current.tool.commands.setRowDate("nope", "2026-11-24"),
    );
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795432987123",
    );
    act(() =>
      rendered.result.current.tool.commands.setRowDate(moscow.id, "2026-11-24"),
    );
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795519387123",
    );
  });

  it("should copy exactly the shown notation", async () => {
    const { rendered, textCopying } = setup();
    act(() => rendered.result.current.tool.commands.typeInput("1795432987123"));
    let outcome: CopyOutcome | undefined;
    await act(async () => {
      outcome = await rendered.result.current.tool.commands.copyNotation(
        "SECONDS" as never,
      );
    });
    expect(outcome).toBe(CopyOutcome.COPIED);
    expect(textCopying.copiedTexts).toEqual(["1795432987"]);
  });

  it("should pin the reference moment without seconds and leave on Show on main page", () => {
    const { rendered, onLeave } = setup();
    act(() => rendered.result.current.tool.commands.typeInput("1795432987123"));
    act(() => rendered.result.current.tool.commands.showOnMainPage());
    const { reference } = rendered.result.current.store?.getSnapshot() ?? {};
    expect(reference?.mode).toBe(ReferenceMode.PINNED);
    expect(
      reference?.mode === ReferenceMode.PINNED && reference.instant.toString(),
    ).toBe("2026-11-23T11:23:00Z");
    expect(onLeave).toHaveBeenCalledOnce();
  });

  it("should present the relative time of a pinned moment again at each minute", () => {
    const { rendered, clock, tickScheduler } = setup();
    act(() => rendered.result.current.tool.commands.typeInput("1795432087"));
    expect(rendered.result.current.tool.converter.relativeTime).toBe(
      "15 минут назад",
    );
    clock.moveTo("2026-11-23T11:24:07Z", "Asia/Almaty");
    act(() => tickScheduler.runPending());
    expect(rendered.result.current.tool.converter.relativeTime).toBe(
      "16 минут назад",
    );
  });

  it("should write its state to the session on every change", () => {
    const { rendered, written } = setup();
    act(() => rendered.result.current.tool.commands.typeInput("1700000000"));
    expect(written.at(-1)).toMatchObject({ inputText: "1700000000" });
  });

  it("should start from a pinned state the session kept", () => {
    const kept = {
      ...createConverterState(
        createSwitchableClock("2026-11-23T11:23:07Z").instant(),
      ),
      mode: ReferenceMode.PINNED,
      inputText: "1700000000",
      isInputTyped: true,
    };
    const { rendered } = setup(JSON.parse(JSON.stringify(kept)));
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1700000000",
    );
  });

  it("should move a live state the session kept to the current second", () => {
    const old = createConverterState(
      createSwitchableClock("2026-11-23T11:00:00Z").instant(),
    );
    const { rendered } = setup(old);
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795432987",
    );
  });

  it("should start live when the session value is not a converter state", () => {
    const { rendered } = setup({ nonsense: true });
    expect(rendered.result.current.tool.converter.input.text).toBe(
      "1795432987",
    );
  });

  it("should follow the list: rows of the location list", () => {
    const { rendered } = setup();
    expect(
      rendered.result.current.tool.converter.rows.map(({ id }) => id),
    ).toEqual([almaty.id, moscow.id]);
  });
});
