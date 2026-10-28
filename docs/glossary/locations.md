# Glossary: Locations

The user's list of places and how each place is shown. Decisions: ADR-0004 (local persistence), ADR-0007 (the Here mark and Here entry). See [README](README.md) for the entry format.

- **World clock state** — the whole model state: the location list, the reference moment, the device time zone and, later, the home location. *Code:* `WorldClockState`. *Not:* the location list alone. *Never:* `LocationsState`, app state, store state.
- **Location** — one place in the user's list: a time zone ID, a city label and a country code. Its identity is the zone plus the label, so two Moscows in the same zone are one location. *Code:* `Location`. *RU:* место. *Never:* city (a location may be a zone without a city), clock, card (a card is how the Cards view shows a location), «локация» in the interface.
- **Location ID** — the stable identifier of a location, built from its time zone ID and city label. *Code:* `buildLocationId`.
- **City label** — the city name a location is shown with, as the user added it, in the nominative case. *Code:* `label`, `cityLabel`. *Never:* title, name (ambiguous with the country name).
- **Country code** — the ISO 3166-1 alpha-2 code of a location's country (`KZ`). The country name is derived from it per interface language. *Code:* `countryCode`, `presentCountryName`.
- **Location list** — the user's ordered locations. Its order is the display order, and the user changes it only by reordering. It is the only stored part of the world clock state (ADR-0004, schema version 1). *Code:* `locations`. *RU:* список. *Never:* favourites, saved cities.
- **Unreadable stored list** — a stored location list that cannot be parsed or holds an invalid entry. The app shows the load error with Reset and never overwrites the stored value by itself. *Code:* `LocationsLoadStatus.UNREADABLE`.
- **Location row** — the presented, view-agnostic data of one location at the effective instant: city label, country name, UTC offset, local time and date, day track, marks. *Code:* `LocationRow`, `presentLocationRows`. *Not:* a card or a grid row, which are view elements built from it.
- **Here mark** — the mark on a location whose time zone ID equals the device time zone: "You are here". *Code:* `LocationMarkKind.HERE`. *RU:* «Вы здесь», подпись «здесь». *Not:* the Here entry. *Never:* current location, my location.
- **Here entry** *(planned)* — a derived row for the device time zone, shown first when no location has the Here mark. It is not stored, cannot be removed and is not a location. *Never:* default location, auto-added location.
- **Reorder** — moving a location to another position in the location list, by dragging its drag handle or by the keyboard. *Code:* `MOVE_LOCATION`. *RU:* переместить. *Never:* sort (the list has no sort key).
- **Drag handle** — the only element of a card that starts a drag reorder. *Code:* `DragHandle`. *Not:* the day track's handle.
