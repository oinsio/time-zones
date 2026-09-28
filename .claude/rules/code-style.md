# Rule: no hardcoded values in code

This rule applies when writing ANY new code and when refactoring existing code.

## What counts as hardcoded

### Numbers (except 0, 1, -1 in loops/indices)
- Timeouts, intervals → `CLOCK_TICK_INTERVAL_MS = 1000`
- HTTP statuses → `HttpStatus.OK`, `HttpStatus.NOT_FOUND`
- Limits, thresholds → `MAX_RETRY_COUNT = 3`
- Sizes, offsets in JS logic → `TOAST_DURATION_MS = 5000`
- Error codes → `ErrorCode.NETWORK_TIMEOUT`

### Strings
- URLs and API endpoints → `API_ENDPOINTS.CALENDAR_EXPORT`
- localStorage / IndexedDB keys → `STORAGE_KEYS.SAVED_LOCATIONS`, `DB_NAME`
- Route names → `ROUTES.INBOX`, `ROUTES.PROJECTS`
- Error messages → constants or i18n keys

### Enums instead of string literals
- Task statuses → `TaskStatus.ACTIVE`, `TaskStatus.COMPLETED`
- Contexts → `enum AppContext`
- Action/event types → `TimeFormat.HOUR_12`, `TimeFormat.HOUR_24`
- Roles, entity types → always enum
- **Rule**: if a value is used in a `switch`, `if`, or for branching — it must be an enum

## Where to place them

| Type                                  | Location                                                                 |
|---------------------------------------|--------------------------------------------------------------------------|
| Business constants (limits, timeouts) | `src/constants/` grouped by domain                                       |
| Enums (statuses, types)               | `src/types/` or `src/enums/` next to the domain model                    |
| API endpoints, URLs                   | `src/constants/api.ts`                                                   |
| Storage keys                          | `src/constants/storage.ts`                                               |
| Routes                                | `src/constants/routes.ts`                                                |
| Environment config (.env)             | `.env` + `src/config.ts`                                                 |

## Examples: bad → good

### Magic numbers

```ts
// ❌ Bad
setInterval(tickClock, 1000);
if (retries > 3) throw new Error("Too many retries");
const locations = searchResults.slice(0, 50);
if (response.status === 200) { ... }
if (response.status === 404) { ... }
```

```ts
// ✅ Good
setInterval(tickClock, CLOCK_TICK_INTERVAL_MS);
if (retries > MAX_RETRY_COUNT) throw new Error(ErrorMessages.TOO_MANY_RETRIES);
const locations = searchResults.slice(0, MAX_SEARCH_RESULTS);
if (response.status === HttpStatus.OK) { ... }
if (response.status === HttpStatus.NOT_FOUND) { ... }
```

### String literals

```ts
// ❌ Bad
localStorage.setItem("savedLocations", serializedLocations);
navigate("/settings");
fetch("https://example.com/api/cities");
```

```ts
// ✅ Good
localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, serializedLocations);
navigate(ROUTES.SETTINGS);
fetch(config.apiUrl);  // from .env via src/config.ts
```

### Enums instead of strings

```ts
// ❌ Bad
if (task.status === "active") { ... }
if (item.type === "project") { ... }
const filtered = tasks.filter(t => t.context === "@home");
```

```ts
// ✅ Good
if (task.status === TaskStatus.ACTIVE) { ... }
if (item.type === EntityType.PROJECT) { ... }
const filtered = tasks.filter(t => t.context === AppContext.HOME);
```

## Exceptions (these are NOT hardcoded values)

- Tailwind classes in JSX: `className="flex items-center gap-2"` — OK
- Numbers 0, 1, -1 in loops, indices, increments
- Strings in `console.log` / `console.error` for debugging
- Object keys and JSON fields during serialization/deserialization
- Strings in tests (test descriptions, mock data) — acceptable

## Mandatory self-check

After writing code, mentally go through this checklist:
1. Are there any numbers other than 0/1/-1? → Extract into a constant
2. Are there strings containing URLs, paths, or entity names? → Extract into a constant
3. Are there strings in conditions (if/switch)? → Create an enum
4. Is any value repeated in 2+ places? → Must be a constant