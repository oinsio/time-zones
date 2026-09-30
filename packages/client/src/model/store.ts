/**
 * Framework-agnostic store around a pure reducer (ADR-0002); read with
 * `useSyncExternalStore` by the controller. Implements FR8, FR10, FR11 of
 * add-locations-via-search (D3).
 */
export type ReduceResult<State, ErrorCode> =
  | { ok: true; state: State }
  | { ok: false; error: ErrorCode };

export type Store<State, Command, ErrorCode> = {
  getSnapshot: () => State;
  subscribe: (onChange: () => void) => () => void;
  dispatch: (command: Command) => ReduceResult<State, ErrorCode>;
};

export function createStore<State, Command, ErrorCode>(
  reducer: (state: State, command: Command) => ReduceResult<State, ErrorCode>,
  initialState: State,
): Store<State, Command, ErrorCode> {
  let currentState = initialState;
  const subscribers = new Set<() => void>();
  return {
    getSnapshot: () => currentState,
    subscribe: (onChange) => {
      subscribers.add(onChange);
      return () => {
        subscribers.delete(onChange);
      };
    },
    dispatch: (command) => {
      const outcome = reducer(currentState, command);
      if (outcome.ok && outcome.state !== currentState) {
        currentState = outcome.state;
        for (const notify of subscribers) notify();
      }
      return outcome;
    },
  };
}
