// Simple in-memory cache for breed data and search results
// Debug: cache module evaluated
console.log("[cache] module evaluated");
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    console.log("[cache] set", { key, ttlMs: ttl, sizeBefore: this.cache.size });
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
    });
    console.log("[cache] set complete", { key, sizeAfter: this.cache.size });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      console.log("[cache] get miss (not found)", { key });
      return null;
    }
    const age = Date.now() - entry.timestamp;
    const expired = age > entry.ttl;
    if (expired) {
      console.log("[cache] get expired -> evict", { key, ageMs: age, ttlMs: entry.ttl });
      this.cache.delete(key);
      return null;
    }
    console.log("[cache] get hit", { key, ageMs: age });
    return entry.data as T;
  }

  has(key: string): boolean {
    const present = this.get(key) !== null;
    console.log("[cache] has", { key, present });
    return present;
  }

  clear(): void {
    console.log("[cache] clear", { sizeBefore: this.cache.size });
    this.cache.clear();
    console.log("[cache] clear complete", { sizeAfter: this.cache.size });
  }

  delete(key: string): void {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    console.log("[cache] delete", { key, existed, sizeNow: this.cache.size });
  }
}

// Singleton instance
export const breedsCache = new SimpleCache();

// Cache key generators
export const CACHE_KEYS = {
  ALL_BREEDS: 'all_breeds',
  SEARCH: (query: string) => `search:${query.toLowerCase()}`,
  BREED_DETAILS: (id: number) => `breed:${id}`,
};
