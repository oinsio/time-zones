# Glossary: App shell

The frame around every view: title, notices, recovery and the states of storage and network. Specs: `openspec/specs/app-shell/`, `app-delivery/`, `main-page/`. See [README](README.md) for the entry format.

- **Shell** — the frame every page renders in: the title, the header actions, the notices region and the error boundary. *Code:* `AppShell`. *Not:* a view.
- **Notice** — a non-blocking message in the notices region that never takes focus. *Never:* toast, snackbar, popup.
- **Offline-ready notice** — the notice that the app now works without network, shown at most once per installation. *Code:* `isOfflineReady`. *RU:* «Приложение готово к работе без сети».
- **Update notice** — the notice that a new version is waiting, with Reload and Dismiss. The app never reloads by itself. *Code:* `isUpdateAvailable`, `applyUpdate`. *RU:* «Доступна новая версия», «Обновить». *Never:* auto-update.
- **Update check** — asking the service worker registration whether a new version exists. *Code:* `registration.update()`.
- **Update recheck** — the update check made when the page becomes visible again, at most once per 15 minutes. iOS never restarts an installed PWA, so the page asks again on return. *Code:* `useUpdateRecheckOnReturn`, `UPDATE_RECHECK_INTERVAL_MS`.
- **Update check failure note** — the polite note that the latest version could not be fetched because the network is unreachable. *Code:* `isUpdateCheckFailed`. *RU:* «Не удалось получить последнюю версию».
- **Recovery screen** — the screen the error boundary shows after an unexpected error, with Reload. *Code:* `RecoveryScreen`, `AppErrorBoundary`. *RU:* «Что-то пошло не так».
- **Storage unavailable** — the state where the location list cannot be saved (private mode, quota). The app keeps working and warns that changes will not be saved. *Code:* `StorageAvailability`. *RU:* «Хранилище недоступно».
- **Offline** — no network. The app works fully; only update checks fail. *Code:* `useOnlineStatus`. *RU:* «без сети». *Never:* disconnected mode.
