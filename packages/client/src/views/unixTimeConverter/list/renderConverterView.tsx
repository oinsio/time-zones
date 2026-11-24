import { render } from "@testing-library/react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
  createInMemoryTextCopying,
} from "@/adapters";
import { LocationsProvider, LocationsStatus } from "@/controller";
import { useUnixTimeConverter } from "@/controller/unixTime";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import type { ConverterViewDefinition } from "../converterViewDefinition";

export const SAMPLE_NOW = "2026-11-23T11:23:07Z";
export const almaty = buildLocation({
  label: "Almaty",
  ...KNOWN_CITIES.Almaty,
});
export const moscow = buildLocation({
  label: "Moscow",
  ...KNOWN_CITIES.Moscow,
});
export const kolkata = buildLocation({
  label: "Kolkata",
  ...KNOWN_CITIES.Kolkata,
});
export const newYork = buildLocation({
  label: "New York",
  ...KNOWN_CITIES["New York"],
});

/** A tick scheduler that holds every scheduled tick until the test runs them. */
export function createCollectingTickScheduler() {
  const pending = new Set<() => void>();
  return {
    schedule: (callback: () => void) => {
      pending.add(callback);
      return () => {
        pending.delete(callback);
      };
    },
    runPending: () => {
      const callbacks = [...pending];
      pending.clear();
      for (const callback of callbacks) callback();
    },
  };
}

type RenderConverterViewOptions = {
  view: ConverterViewDefinition;
  locations?: ReturnType<typeof buildLocation>[];
  shouldFocusInput?: boolean;
  isListLoading?: boolean;
};

function ConverterHarness({
  view,
  tickScheduler,
  textCopying,
  shouldFocusInput,
  isListLoading,
}: {
  view: ConverterViewDefinition;
  tickScheduler: ReturnType<typeof createCollectingTickScheduler>;
  textCopying: ReturnType<typeof createInMemoryTextCopying>;
  shouldFocusInput: boolean;
  isListLoading?: boolean;
}) {
  const { converter, commands, loadStatus } = useUnixTimeConverter({
    session: { read: () => undefined, write: () => {} },
    tickScheduler,
    textCopying,
    onLeave: () => {},
  });
  const View = view.component;
  return (
    <View
      converter={converter}
      commands={commands}
      shouldFocusInput={shouldFocusInput}
      isListLoading={isListLoading ?? loadStatus !== LocationsStatus.READY}
    />
  );
}

/** Renders a converter view on the sample of the converter specs, with the in-memory ports. */
export function renderConverterView({
  view,
  locations = [almaty, moscow, kolkata, newYork],
  shouldFocusInput = false,
  isListLoading,
}: RenderConverterViewOptions) {
  const clock = createSwitchableClock(SAMPLE_NOW, "Asia/Almaty");
  const tickScheduler = createCollectingTickScheduler();
  const textCopying = createInMemoryTextCopying();
  const backend = createInMemoryLocationBackend({
    status: LocationsLoadStatus.LOADED,
    locations,
    homeLocationId: locations[0]?.id ?? null,
  });
  const rendered = render(
    <LocationsProvider
      repository={createInMemoryLocationRepository({ backend })}
      writeScheduler={immediateWriteScheduler}
      clock={clock}
      tickScheduler={createCollectingTickScheduler()}
    >
      <ConverterHarness
        view={view}
        tickScheduler={tickScheduler}
        textCopying={textCopying}
        shouldFocusInput={shouldFocusInput}
        isListLoading={isListLoading}
      />
    </LocationsProvider>,
  );
  return { rendered, clock, tickScheduler, textCopying };
}
