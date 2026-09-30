import type { LocationsSyncChannel } from "@/adapters";

type MessageListener = () => void;

/**
 * Stand-in for `BroadcastChannel`: channels made by one hub deliver each
 * other's messages synchronously and never their own.
 */
export function createInMemoryChannelHub() {
  const channels = new Set<{ listeners: Set<MessageListener> }>();
  return {
    createChannel(): LocationsSyncChannel {
      const self = { listeners: new Set<MessageListener>() };
      channels.add(self);
      return {
        postMessage: () => {
          for (const other of channels) {
            if (other === self) continue;
            for (const listener of other.listeners) listener();
          }
        },
        addEventListener: (_type, listener) => self.listeners.add(listener),
        removeEventListener: (_type, listener) =>
          self.listeners.delete(listener),
      };
    },
  };
}
