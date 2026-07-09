import { ICacheStrategy } from "./ICacheStrategy"

export class InfiniteCacheStrategy implements ICacheStrategy {
  isValid(_cachedAtTimestamp: number): boolean {
    return true
  }

  getTTL(): number {
    return Infinity
  }
}
