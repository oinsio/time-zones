import {
  type ComponentType,
  lazy,
  Suspense,
  useCallback,
  useRef,
  useState,
} from "react";
import type { LoadCitySearch } from "@/ports";
import { AddLocationButton } from "./AddLocationButton";
import type { OpenLocationSearchProps } from "./OpenLocationSearch";
import { useSearchShortcut } from "./useSearchShortcut";

/** The overlay with its search data and dialog loads when the search first opens: the initial JavaScript is budgeted (NFR-P1 of add-unix-time-converter-tool). */
const LazyOpenLocationSearch = lazy(() =>
  import("./OpenLocationSearch").then(({ OpenLocationSearch: overlay }) => ({
    default: overlay,
  })),
);

type LocationSearchProps = {
  /** Only tests set this: an overlay already loaded, for a test that resets the module registry between scenarios. */
  overlay?: ComponentType<OpenLocationSearchProps>;
  /** Only tests set this; production uses the loader of the `LocationsProvider`. */
  loadCitySearch?: LoadCitySearch;
};

/**
 * The "Add location" trigger and its search overlay, with the polite region
 * that announces an addition. The search data is requested only once the
 * overlay opens.
 * Implements FR6, FR8, FR15, FR17, NFR-P2, NFR-A2 of add-locations-via-search
 * (D10), and FR1 of open-location-search-with-slash-shortcut (D3).
 * Implements FR8 of show-here-entry-for-device-time (D4): the search loads
 * through the loader of the provider, shared with the device time location.
 * Implements FR6 of add-city-coordinates-to-locations (D6): the added city
 * location carries the coordinates of its search result.
 * Implements FR2, FR11 of add-settings-page-and-device-time-location (D11,
 * D12): lives in the header and owns the "added" announcement.
 */
export function LocationSearch({
  loadCitySearch,
  overlay: Overlay = LazyOpenLocationSearch,
}: LocationSearchProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const openSearch = useCallback(() => setIsOpen(true), []);
  useSearchShortcut({ isEnabled: !isOpen, onShortcut: openSearch });

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    buttonRef.current?.focus();
  };

  return (
    <>
      <AddLocationButton ref={buttonRef} onClick={openSearch} />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      {isOpen && (
        <Suspense fallback={null}>
          <Overlay
            loadCitySearch={loadCitySearch}
            onAdded={setAnnouncement}
            onClose={() => setIsOpen(false)}
            onCloseAutoFocus={handleCloseAutoFocus}
          />
        </Suspense>
      )}
    </>
  );
}
