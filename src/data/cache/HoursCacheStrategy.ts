import { ICacheStrategy } from "./ICacheStrategy"

export class HoursCacheStrategy implements ICacheStrategy {
  readonly ttlMs = 60 * 60 * 1000 // 1 hora

  isValid(cachedAtTimestamp: number): boolean {
    const now = Date.now()
    return now - cachedAtTimestamp < this.ttlMs
  }

  getTTL(): number {
    return this.ttlMs
  }
}