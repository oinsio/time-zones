import { useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Clock } from "@/lib/temporal";
import { isDeviceTimeLocation, ReferenceMode } from "@/model";
import {
  ConverterCommandType,
  createConverterState,
  isConverterState,
  reduceConverter,
} from "@/model/unixTime";
import type { TextCopying } from "@/ports";
import { presentConverter } from "@/presenter/unixTime";
import type { ToolSession } from "@/tools";
import type { TickScheduler } from "../tickScheduler";
import { useActiveInterfaceLanguage } from "../useActiveInterfaceLanguage";
import { useCityLabels } from "../useCityLabels";
import { useExemplarCity } from "../useExemplarCity";
import { useHourFormat } from "../useHourFormat";
import { useLocationList } from "../useLocationList";
import { useMinuteTick } from "../useMinuteTick";
import { useZoneLabelParts } from "../useZoneLabelParts";
import { useConverterCommands } from "./useConverterCommands";
import { useSecondTick } from "./useSecondTick";

type UnixTimeConverterInput = {
  session: ToolSession;
  tickScheduler: TickScheduler;
  textCopying: TextCopying;
  /** Leaves the tool page: Show on main page calls it after pinning the reference moment. */
  onLeave: () => void;
};

/**
 * The one hook of the converter page: the converter reducer, the presented
 * data, the second tick while live, the tool session and the commands. The
 * clock is the one of the locations. A session value that is not a converter
 * state starts live; a live one is moved to the current second at once.
 * Implements FR9, FR11, FR12, FR13, FR14, FR16, NFR-P2 of add-unix-time-converter-tool (D8).
 */
export function useUnixTimeConverter({
  session,
  tickScheduler,
  textCopying,
  onLeave,
}: UnixTimeConverterInput) {
  const { t } = useTranslation();
  const { code: language } = useActiveInterfaceLanguage();
  const hourFormat = useHourFormat();
  const zoneLabelParts = useZoneLabelParts();
  const list = useLocationList();
  const { clock } = list;
  const [state, dispatch] = useReducer(reduceConverter, undefined, () =>
    restoreState(session.read(), clock),
  );
  const [minuteCount, setMinuteCount] = useState(0);
  const deviceTimeLocation = list.locations.find(isDeviceTimeLocation);
  const deviceTimeCityLabel = useExemplarCity(
    deviceTimeLocation?.timeZoneId,
    list.loadCitySearch,
  );
  const cityLabels = useCityLabels(list.locations, list.loadCitySearch);

  useEffect(() => {
    session.write(state);
  }, [session, state]);
  useSecondTick({
    clock,
    tickScheduler,
    isEnabled: state.mode === ReferenceMode.LIVE,
    onTick: () =>
      dispatch({
        type: ConverterCommandType.TICK,
        nowEpochMilliseconds: clock.instant().epochMilliseconds,
      }),
  });
  useMinuteTick({
    clock,
    tickScheduler,
    onTick: () => setMinuteCount((count) => count + 1),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: minuteCount re-presents the relative time at each minute
  const presented = useMemo(
    () =>
      presentConverter(state, list.locations, {
        now: clock.instant(),
        language,
        hourFormat,
        zoneLabelParts,
        translate: t,
        deviceTimeZoneId: list.deviceTimeZoneId,
        homeLocationId: list.homeLocationId,
        deviceTimeCityLabel,
        cityLabels,
      }),
    [
      state,
      list.locations,
      list.deviceTimeZoneId,
      list.homeLocationId,
      clock,
      language,
      hourFormat,
      zoneLabelParts,
      t,
      deviceTimeCityLabel,
      cityLabels,
      minuteCount,
    ],
  );
  const commands = useConverterCommands({
    state,
    presented,
    dispatch,
    clock,
    textCopying,
    onLeave,
  });
  return { converter: presented, commands, loadStatus: list.loadStatus };
}

function restoreState(kept: unknown, clock: Clock) {
  if (!isConverterState(kept)) return createConverterState(clock.instant());
  return kept.mode === ReferenceMode.LIVE
    ? reduceConverter(kept, {
        type: ConverterCommandType.TICK,
        nowEpochMilliseconds: clock.instant().epochMilliseconds,
      })
    : kept;
}
