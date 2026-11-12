import { SETTINGS_FOOTNOTE_CLASS_NAME } from "@/constants";
import { useDeployTime } from "@/controller";

/**
 * The deploy time line at the end of the settings page, in the icon colour.
 * It is plain text: no focus stop, no role, no live region.
 * Implements FR5, NFR-A1, UX2 of polish-settings-and-remove-offline-update-notice (D4).
 */
export function DeployTime() {
  const deployTime = useDeployTime();
  return (
    <p data-deploy-time className={SETTINGS_FOOTNOTE_CLASS_NAME}>
      {deployTime}
    </p>
  );
}
