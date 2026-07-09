import { ICacheStrategy } from './ICacheStrategy'

export class DaysCacheStrategy implements ICacheStrategy {
  readonly ttlMs = 24 * 60 * 60 * 1000

  isValid(cachedAtTimestamp: number): boolean {
    const now = Date.now()
    return now - cachedAtTimestamp < this.ttlMs
  }

  getTTL(): number {
    return this.ttlMs
  }
}