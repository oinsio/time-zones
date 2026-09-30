import { useEffect, useState } from "react";

const ONLINE_EVENT = "online";
const OFFLINE_EVENT = "offline";

/**
 * Whether the browser reports a network connection.
 * Implements FR8 of add-main-page-scaffold.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener(ONLINE_EVENT, handleOnline);
    window.addEventListener(OFFLINE_EVENT, handleOffline);
    return () => {
      window.removeEventListener(ONLINE_EVENT, handleOnline);
      window.removeEventListener(OFFLINE_EVENT, handleOffline);
    };
  }, []);

  return isOnline;
}
