export class Cache<T = unknown> {
  cache: Map<string, T>
  constructor(public maxSize: number) {
    this.maxSize = maxSize
    this.cache = new Map()
  }

  get(key: string) {
    const value = this.cache.get(key)
    if (value === undefined)
      return undefined

    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  add(key: string, value: T) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, value)
  }

  set(key: string, value: T) {
    this.cache.set(key, value)
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  getAll() {
    return Array.from(this.cache.values())
  }
}
