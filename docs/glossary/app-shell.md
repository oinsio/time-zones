# Glossary: App shell

The frame around every view: title, notices, recovery and the states of storage and network. Specs: `openspec/specs/app-shell/`, `app-delivery/`, `main-page/`. See [README](README.md) for the entry format.

- **Shell** — the frame every page renders in: the title, the header actions, the notices region and the error boundary. *Code:* `AppShell`. *Not:* a view.
- **Notice** — a non-blocking message in the notices region that never takes focus. *Never:* toast, snackbar, popup.
- **Offline-ready notice** — the notice that the app now works without network, shown at most once per installation. *Code:* `isOfflineReady`. *RU:* «Приложение готово к работе без сети».
- **Update notice** — the notice that a new build is waiting, shown only when the app revision of the site differs from the running build's, with Reload and Dismiss. The app never reloads by itself. *Code:* `isUpdateAvailable`, `applyUpdate`. *RU:* «Доступна новая версия», «Обновить». *Never:* auto-update.
- **Update check** — asking the service worker registration whether a new version exists; a failed check is silent. *Code:* `registration.update()`.
- **Update recheck** — the update check made when the page becomes visible again, at most once per 15 minutes. iOS never restarts an installed PWA, so the page asks again on return. *Code:* `useRecheckOnReturn` (shared with the zone rules update check), `useUpdateRecheckOnReturn`, `UPDATE_RECHECK_INTERVAL_MS`.
- **Zone rules update notice** — the notice that a newer zone rules release is stored, changes a watched zone and Reload will use it, with Reload and Dismiss; it stays dismissed until a newer release is stored. *RU:* «Доступны правила часовых поясов …». *Code:* `ZoneRulesUpdateNotice`, `app.zoneRulesReady`.
- **Recovery screen** — the screen the error boundary shows after an unexpected error, with Reload. *Code:* `RecoveryScreen`, `AppErrorBoundary`. *RU:* «Что-то пошло не так».
- **Storage unavailable** — the state where the location list cannot be saved (private mode, quota). The app keeps working and warns that changes will not be saved. *Code:* `StorageAvailability`. *RU:* «Хранилище недоступно».
- **Offline** — no network. The app works fully and shows no note; a failed update check is silent. *RU:* «без сети». *Never:* disconnected mode.
- **Meeting copied notice** — the notice that Share meeting copied the text where the browser cannot share. *RU:* «Текст встречи скопирован». *Code:* `MeetingShareNotice.COPIED`.
- **Share failed notice** — the notice that Share meeting could neither share nor copy. *RU:* «Не удалось поделиться встречей». *Code:* `MeetingShareNotice.FAILED`.
- **App revision** — the opaque string that identifies the app of a build: the newest commit without the data-only trailer, or an explicit `APP_REVISION`. It is fixed into the build and published as `app-revision.json`; the client only compares two of them. *Code:* `APP_REVISION`, `resolveAppRevision`, `AppRevisionSource`, `app-revision.json`. *Never:* version, version number, build number.
- **Waiting build** — a newer build that the service worker has installed and that waits for activation, whether or not the update notice is shown. *Code:* `isBuildWaiting`.
- **Silent update** — a waiting build with the same app revision as the running one (data only): no notice, and the browser activates it at the next start. *RU:* тихое обновление. *Never:* auto-update, background update.
