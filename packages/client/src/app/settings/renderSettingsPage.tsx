import { render } from "@testing-library/react";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { fakeClock } from "@/lib/temporal";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { SettingsPage } from "./SettingsPage";

export const renderSettingsPage = (
  repository = createInMemoryPreferencesRepository(),
  onBack = vi.fn(),
) => {
  const writeScheduler = createManualWriteScheduler();
  render(
    <PreferencesProvider
      repository={repository}
      writeScheduler={writeScheduler}
    >
      <LocationsProvider
        repository={createInMemoryLocationRepository()}
        writeScheduler={immediateWriteScheduler}
        clock={fakeClock("2026-07-15T12:00:00Z")}
        tickScheduler={createManualTickScheduler()}
      >
        <SettingsPage notices={<p>a notice</p>} onBack={onBack} />
      </LocationsProvider>
    </PreferencesProvider>,
  );
  return { repository, writeScheduler, onBack };
};
