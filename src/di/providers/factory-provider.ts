/**
 * Factory provider implementation
 * Uses a factory function to create instances
 */

import type { Provider, DIContainer, FactoryProvider as IFactoryProvider } from '../types/di-types.js';

export class FactoryProvider<T> implements IFactoryProvider<T> {
  readonly type = 'transient' as const;

  constructor(
    public readonly factory: (container: DIContainer) => T,
    private readonly disposeFn?: (instance: T) => Promise<void>
  ) {}

  create(container: DIContainer): T {
    return this.factory(container);
  }

  async dispose(instance: T): Promise<void> {
    if (this.disposeFn) {
      await this.disposeFn(instance);
    }
  }
}