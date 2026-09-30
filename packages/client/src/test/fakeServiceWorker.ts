import { useState } from "react";
import { vi } from "vitest";

type RegisteredCallback = (
  serviceWorkerUrl: string,
  registration: ServiceWorkerRegistration,
) => void;

/** State of the fake service worker that BDD steps configure per scenario. */
export const fakeServiceWorker = {
  isUpdateAvailable: false,
  shouldUpdateCheckFail: false,
  onRegisteredSW: undefined as RegisteredCallback | undefined,
};

/** Real React state behind the `useRegisterSW` contract. */
export const fakeServiceWorkerModule = {
  useRegisterSW: (options?: { onRegisteredSW?: RegisteredCallback }) => {
    fakeServiceWorker.onRegisteredSW = options?.onRegisteredSW;
    return {
      offlineReady: useState(false),
      needRefresh: useState(fakeServiceWorker.isUpdateAvailable),
      updateServiceWorker: vi.fn(),
    };
  },
};

/** Reports a registration whose update check rejects, as offline does. */
export const failUpdateCheck = () => {
  const registration = {
    update: () => Promise.reject(new TypeError("network unreachable")),
  } as unknown as ServiceWorkerRegistration;
  fakeServiceWorker.onRegisteredSW?.("sw.js", registration);
};
