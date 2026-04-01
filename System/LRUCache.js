export default class LRUCache {
  constructor({ max = 10000, ttl = 60_000 } = {}) {
    this.max = max;
    this.ttl = ttl;
    this.cache = new Map();
  }

  _now() {
    return Date.now();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL check
    if (item.expiry < this._now()) {
      this.cache.delete(key);
      return null;
    }

    // refresh LRU (move to end)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key, value) {
    const expiry = this._now() + this.ttl;

    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, { value, expiry });

    // Evict oldest (LRU)
    if (this.cache.size > this.max) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}
