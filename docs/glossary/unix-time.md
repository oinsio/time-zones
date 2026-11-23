# Glossary: Unix time

The Unix time converter and the numbers it reads and writes. Decisions: ADR-0021 (exact instants without BigInt; handoff H1 of add-unix-time-converter-tool), ADR-0022 (view registries of tool pages). See [README](README.md) for the entry format.

- **Unix time** — the count of seconds (or of a finer unit) since 1970-01-01T00:00:00Z, leap seconds not counted. *RU:* «Unix-время». *Never:* epoch time, POSIX time, timestamp.
- **Unix time unit** — seconds, milliseconds, microseconds or nanoseconds of a Unix time. *Code:* `UnixTimeUnit`, `UNIX_TIME_UNIT_FRACTION_DIGITS`.
- **Unit detection** — the guess of the unit from the digit count of a typed whole number. *Code:* `detectUnixTimeUnit`.
- **Unit choice** — automatic (detection decides) or one fixed unit. *Code:* `UnixTimeUnitChoice`.
- **Exact instant** — an instant kept as whole `unixSeconds` and `nanoseconds` so that nine fraction digits never lose precision. *Code:* `ExactInstant`, `toInstant`, `isExactInstantInRange`.
- **Converter moment** — the one moment the converter shows in every row and notation: live at the clock's whole second, or pinned by the user's input. *Code:* `ConverterState`, `reduceConverter`.
- **Unix time converter** — the tool that turns a Unix time or an ISO 8601 text into wall-clock times of the user's locations, and back. *RU:* «Конвертер Unix-времени». *Code:* `ToolId.UNIX_TIME_CONVERTER`, `UnixTimeConverterPage`.
- **Converter input** — the text field that takes a Unix time or an ISO 8601 instant with an offset. *Code:* `parseUnixTimeText`, `parseIsoInstantText`, `ConverterInputField`.
- **Converter row** — one location of the list with its time to the second, its date and a field to type a time or date. *Code:* `presentConverterRows`, `reduceConverterRow`.
- **Exact wall-time input** — a time typed in a converter row, with seconds and up to nine fraction digits. *Code:* `parseExactWallTimeInput`.
- **Moment notation** — one written form of the converter moment (Unix time in a unit, ISO 8601 with `Z`, ISO 8601 in the device zone), each with a copy action. *Code:* `formatUnixTime`, `formatExactIsoInstant`, `MomentNotations`.
- **Relative time** — the converter moment against the current time, in the largest non-zero unit, rounded towards zero. *Code:* `getRelativeTime`, `RelativeTimeUnit`, `presentRelativeTime`.
- **Show on main page** — the converter action that sets the reference moment of the main page to the converter moment. *RU:* «Показать на главной».
- **Converter view** — one interchangeable interface of the converter page. *Code:* `src/views/unixTimeConverter/`, `ConverterViewDefinition`.
- **Converter view registry** — the list of converter views; resolved by `resolveActiveView`. *Code:* `converterViewRegistry`, `ConverterViewId`.
