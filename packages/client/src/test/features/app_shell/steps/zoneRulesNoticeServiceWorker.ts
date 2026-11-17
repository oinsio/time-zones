// The fake service worker of the zone rules notice unit steps; apart from the world so the mock factory does not wait on the app import (apply-data-updates-silently FR11).
import { vi } from "vitest";

export const fakeServiceWorker = {
  isUpdateAvailable: false,
  updateServiceWorker: vi.fn(),
};
