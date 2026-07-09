import { ICacheStrategy } from "./ICacheStrategy"

export class MinutesCacheStrategy implements ICacheStrategy {
  readonly ttlMs = 30 * 60 * 1000 // 30min

  isValid(cachedAtTimestamp: number): boolean {
    const now = Date.now()
    return now - cachedAtTimestamp < this.ttlMs
  }

  getTTL(): number {
    return this.ttlMs
  }
}