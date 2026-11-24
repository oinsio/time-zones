// Implements FR6, FR7 of add-unix-time-converter-tool: the converter page over an in-memory location list.

import { render, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
  createInMemoryTextCopying,
} from "@/adapters";
import {
  LocationsProvider,
  PreferencesProvider,
  useReferenceMoment,
} from "@/controller";
import { LocationsLoadStatus, PreferencesLoadStatus } from "@/ports";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { UnixTimeConverterPage } from "@/tools/unixTimeConverter";
import type { ConverterViewDefinition } from "@/views/unixTimeConverter";

export const SAMPLE_NOW = "2026-11-23T11:23:07Z";
export const DEVICE_ZONE = "Asia/Almaty";
const INPUT_NAME =
  /^(Unix-время или дата ISO 8601|Unix time or ISO 8601 date)$/;
const SAMPLE_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"] as const;

/** Pins the reference moment of the main page to a date: the converter must not follow it. */
const ReferenceDatePinner = ({ isoDate }: { isoDate: string | undefined }) => {
  const { selectDate } = useReferenceMoment();
  useEffect(() => {
    if (isoDate !== undefined) selectDate(isoDate);
  }, [isoDate, selectDate]);
  return null;
};

/** Per-scenario state of the converter features: the page, its clock and its tick scheduler. */
/** Holds every scheduled tick until the scenario runs them: the page schedules more than one. */
const createCollectingTickScheduler = () => {
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
};

export const createConverterWorld = () => {
  const tickScheduler = createCollectingTickScheduler();
  const textCopying = createInMemoryTextCopying();
  const clock = createSwitchableClock(SAMPLE_NOW, DEVICE_ZONE);

  const hourFormat = { current: HourFormat.H24 };
  const pinnedDate = { current: undefined as string | undefined };
  const openWith = async (
    cities: readonly string[],
    registry?: readonly ConverterViewDefinition[],
  ) => {
    const backend = createInMemoryLocationBackend({
      status: LocationsLoadStatus.LOADED,
      locations: cities.map((label) =>
        buildLocation({ label, ...KNOWN_CITIES[label] }),
      ),
      homeLocationId: null,
    });
    render(
      <PreferencesProvider
        repository={createInMemoryPreferencesRepository({
          initialDocument: {
            status: PreferencesLoadStatus.LOADED,
            preferences: {
              ...DEFAULT_PREFERENCES,
              hourFormat: hourFormat.current,
            },
          },
        })}
        writeScheduler={immediateWriteScheduler}
      >
        <LocationsProvider
          repository={createInMemoryLocationRepository({ backend })}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          <ReferenceDatePinner isoDate={pinnedDate.current} />
          <UnixTimeConverterPage
            notices={null}
            onBack={() => undefined}
            session={{ read: () => undefined, write: () => undefined }}
            services={{ tickScheduler, textCopying }}
            registry={registry}
          />
        </LocationsProvider>
      </PreferencesProvider>,
    );
    await screen.findByRole("textbox", { name: INPUT_NAME });
  };

  const open = () => openWith(SAMPLE_CITIES);
  const input = () => screen.getByRole("textbox", { name: INPUT_NAME });
  /** Replaces the text at once, as a paste of a whole text does, so no half-typed text is read on the way. */
  const type = async (text: string) => {
    await userEvent.clear(input());
    await userEvent.click(input());
    await userEvent.paste(text);
  };
  const timeOf = (city: string) =>
    screen.getByRole("button", { name: new RegExp(`^Время — ${city},`) })
      .textContent;
  const chooseUnit = (unitName: string) =>
    userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Единица Unix-времени" }),
      unitName,
    );

  return {
    open,
    openWith,
    input,
    type,
    timeOf,
    chooseUnit,
    tickScheduler,
    textCopying,
    clock,
    /** The hour format the next opened page shows. */
    setHourFormat: (format: HourFormat) => {
      hourFormat.current = format;
    },
    /** The reference moment the next opened page finds pinned to this date. */
    pinReferenceDate: (isoDate: string) => {
      pinnedDate.current = isoDate;
    },
    reset: () => {
      hourFormat.current = HourFormat.H24;
      pinnedDate.current = undefined;
    },
  };
};

/** The message under the converter input: the element the input is described by. */
export const readInputMessage = (input: HTMLElement): string | undefined => {
  const messageId = input.getAttribute("aria-describedby");
  return messageId === null
    ? undefined
    : (document.getElementById(messageId)?.textContent ?? undefined);
};
