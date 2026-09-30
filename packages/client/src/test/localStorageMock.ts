// Node.js 25+ has a built-in global `localStorage` that stores nothing without
// --localstorage-file. Replace it with a working in-memory implementation.
// setup.ts imports this module first: its other imports (the i18n language
// detector) probe localStorage while loading, before setup.ts's own code runs.
const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: createLocalStorageMock(),
  writable: true,
  configurable: true,
});
