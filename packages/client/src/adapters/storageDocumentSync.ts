/** The part of `BroadcastChannel` the adapters use. */
export interface StorageSyncChannel {
  postMessage(message: unknown): void;
  addEventListener(type: "message", listener: () => void): void;
  removeEventListener(type: "message", listener: () => void): void;
}

export type StorageDocumentSyncOptions = {
  /** Key of the stored document; a `storage` event for another key is ignored. */
  storageKey: string;
  channelName: string;
  /** Returns `undefined` where cross-tab messaging is unavailable. */
  createChannel?: () => StorageSyncChannel | undefined;
};

export type StorageDocumentSync = {
  /** Tells the other tabs the document changed; never throws. */
  announceChange: () => void;
  /** Calls `onChange` for a change made by another tab; returns the unsubscribe function. */
  subscribe: (onChange: () => void) => () => void;
};

const CHANNEL_MESSAGE_EVENT = "message";
const STORAGE_EVENT = "storage";
const CHANNEL_MESSAGE = "changed";

/**
 * The one owner of cross-tab sync of a stored document: a `BroadcastChannel`,
 * or `storage` events where it is missing.
 * Implements FR7 of add-settings-page-and-device-time-location (D6).
 * Implements FR9, FR11, FR12, FR13, FR14 of add-locations-via-search (D4): the
 * code moved from the locations repository.
 */
export function createStorageDocumentSync({
  storageKey,
  channelName,
  createChannel = () =>
    typeof BroadcastChannel === "undefined"
      ? undefined
      : new BroadcastChannel(channelName),
}: StorageDocumentSyncOptions): StorageDocumentSync {
  let channel: StorageSyncChannel | undefined;
  let isChannelCreated = false;

  const getChannel = (): StorageSyncChannel | undefined => {
    if (!isChannelCreated) {
      isChannelCreated = true;
      try {
        channel = createChannel();
      } catch {
        // Without a channel the other tabs catch up on their next load.
      }
    }
    return channel;
  };

  return {
    announceChange: () => {
      try {
        getChannel()?.postMessage(CHANNEL_MESSAGE);
      } catch {
        // Other tabs catch up on their next load.
      }
    },
    subscribe: (onChange) => {
      const syncChannel = getChannel();
      if (syncChannel) {
        syncChannel.addEventListener(CHANNEL_MESSAGE_EVENT, onChange);
        return () =>
          syncChannel.removeEventListener(CHANNEL_MESSAGE_EVENT, onChange);
      }
      const onStorageEvent = (storageEvent: StorageEvent) => {
        if (storageEvent.key === storageKey || storageEvent.key === null) {
          onChange();
        }
      };
      globalThis.addEventListener(STORAGE_EVENT, onStorageEvent);
      return () =>
        globalThis.removeEventListener(STORAGE_EVENT, onStorageEvent);
    },
  };
}
