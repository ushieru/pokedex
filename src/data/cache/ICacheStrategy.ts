export interface ICacheStrategy {
  isValid(cachedAtTimestamp: number): boolean
  getTTL(): number
}
