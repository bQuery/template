/**
 * @module StorageService
 * Thin wrapper around the bQuery platform storage API.
 *
 * Provides a type-safe, singleton service for key-value persistence
 * backed by `localStorage` via the bQuery `StorageAdapter`.
 */

import { storage, type StorageAdapter } from '@bquery/bquery/platform';

/**
 * Type-safe key-value storage service backed by `localStorage`.
 *
 * All methods delegate to the bQuery `StorageAdapter` which returns
 * promises, so every call is inherently async-safe even when the
 * underlying engine is synchronous.
 *
 * @example
 * ```ts
 * import { storageService } from "@/services/storage.service";
 *
 * await storageService.set("user", { id: "1", name: "Ada" });
 * const user = await storageService.get<User>("user");
 * ```
 */
class StorageService {
  /** Internal storage adapter instance. */
  private readonly adapter: StorageAdapter;

  constructor() {
    this.adapter = storage.local();
  }

  /**
   * Retrieve a value from storage.
   *
   * @typeParam T - Expected type of the stored value.
   * @param key - Storage key to look up.
   * @returns The deserialised value, or `null` if the key does not exist.
   */
  async get<T>(key: string): Promise<T | null> {
    return this.adapter.get<T>(key);
  }

  /**
   * Persist a value under the given key.
   *
   * @typeParam T - Type of the value being stored.
   * @param key   - Storage key.
   * @param value - Value to serialise and store.
   */
  async set<T>(key: string, value: T): Promise<void> {
    return this.adapter.set<T>(key, value);
  }

  /**
   * Remove a single entry from storage.
   *
   * @param key - Storage key to remove.
   */
  async remove(key: string): Promise<void> {
    return this.adapter.remove(key);
  }

  /**
   * Remove **all** entries from storage.
   */
  async clear(): Promise<void> {
    return this.adapter.clear();
  }

  /**
   * Check whether a key exists in storage.
   *
   * @param key - Storage key to test.
   * @returns `true` if the key has a stored value.
   */
  async has(key: string): Promise<boolean> {
    const value = await this.adapter.get<unknown>(key);
    return value !== null;
  }
}

/**
 * Pre-instantiated singleton storage service.
 * Import this directly instead of creating new instances.
 */
export const storageService = new StorageService();
