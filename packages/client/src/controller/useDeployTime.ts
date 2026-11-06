import { useContext, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { APP_DEPLOY_INSTANT } from "@/constants";
import { Temporal } from "@/lib/temporal";
import { formatDeployTime } from "@/presenter";
import { LocationsContext } from "./locationsContext";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
import { useHourFormat } from "./useHourFormat";

const MISSING_PROVIDER_MESSAGE =
  "useDeployTime must be used inside a LocationsProvider";

const DEPLOY_INSTANT = Temporal.Instant.from(APP_DEPLOY_INSTANT);

/**
 * The deploy time line of the settings page, in the device time zone, the
 * active language and the hour format.
 * Implements FR5, FR6 of polish-settings-and-remove-offline-update-notice (D3).
 */
export function useDeployTime(): string {
  const context = useContext(LocationsContext);
  if (context === null) throw new Error(MISSING_PROVIDER_MESSAGE);
  const { store } = context;
  const { deviceTimeZoneId } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  );
  const { t } = useTranslation();
  const { code: language } = useActiveInterfaceLanguage();
  const hourFormat = useHourFormat();
  return formatDeployTime({
    deployInstant: DEPLOY_INSTANT,
    deviceTimeZoneId,
    language,
    hourFormat,
    translate: t,
  });
}
