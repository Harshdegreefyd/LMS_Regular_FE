import { sha256 } from '@noble/hashes/sha2';
import { utf8ToBytes } from '@noble/hashes/utils';

class SecureCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 30 * 60 * 1000;
  }

  generateCacheKey(data) {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const hash = sha256(utf8ToBytes(dataString));
    return Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  set(key, data) {
    const cacheKey = this.generateCacheKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_DURATION
    });
  }

  get(key) {
    const cacheKey = this.generateCacheKey(key);
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const secureCache = new SecureCache();

setInterval(() => {
  secureCache.cleanup();
}, 5 * 60 * 1000);
