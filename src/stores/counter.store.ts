import { createStore } from '@bquery/bquery/store';

type CounterState = { count: number };
type CounterGetters = { doubled: number; isPositive: boolean; isNegative: boolean };
type CounterActions = {
  increment(): void;
  decrement(): void;
  reset(): void;
  incrementBy(amount: number): void;
};

/**
 * Counter demo store.
 *
 * A minimal store illustrating the bQuery reactive store API with
 * increment, decrement, reset, and arbitrary step operations.
 */
export const counterStore = createStore<CounterState, CounterGetters, CounterActions>({
  id: 'counter',

  state: () => ({ count: 0 }),

  getters: {
    doubled: (state) => state.count * 2,
    isPositive: (state) => state.count > 0,
    isNegative: (state) => state.count < 0,
  },

  actions: {
    increment() { this.count = this.count + 1; },
    decrement() { this.count = this.count - 1; },
    reset() { this.count = 0; },
    incrementBy(amount: number) { this.count = this.count + amount; },
  } as any,
});
