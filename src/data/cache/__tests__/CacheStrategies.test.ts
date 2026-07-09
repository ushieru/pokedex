import { DaysCacheStrategy } from '../DaysCacheStrategy';
import { HoursCacheStrategy } from '../HoursCacheStrategy';
import { MinutesCacheStrategy } from '../MinutesCacheStrategy';
import { InfiniteCacheStrategy } from '../InfiniteCacheStrategy';

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

describe('DaysCacheStrategy', () => {
  const strategy = new DaysCacheStrategy();

  it('should have a TTL of 24 hours', () => {
    expect(strategy.getTTL()).toBe(ONE_DAY_MS);
  });

  it('should be valid for a timestamp cached now', () => {
    expect(strategy.isValid(Date.now())).toBe(true);
  });

  it('should be valid for a timestamp cached 23 hours ago', () => {
    const twentyThreeHoursAgo = Date.now() - 23 * ONE_HOUR_MS;
    expect(strategy.isValid(twentyThreeHoursAgo)).toBe(true);
  });

  it('should be invalid for a timestamp cached 25 hours ago', () => {
    const twentyFiveHoursAgo = Date.now() - 25 * ONE_HOUR_MS;
    expect(strategy.isValid(twentyFiveHoursAgo)).toBe(false);
  });
});

describe('HoursCacheStrategy', () => {
  const strategy = new HoursCacheStrategy();

  it('should have a TTL of 1 hour', () => {
    expect(strategy.getTTL()).toBe(ONE_HOUR_MS);
  });

  it('should be valid for a timestamp cached now', () => {
    expect(strategy.isValid(Date.now())).toBe(true);
  });

  it('should be valid for a timestamp cached 30 minutes ago', () => {
    const thirtyMinutesAgo = Date.now() - 30 * ONE_MINUTE_MS;
    expect(strategy.isValid(thirtyMinutesAgo)).toBe(true);
  });

  it('should be invalid for a timestamp cached 2 hours ago', () => {
    const twoHoursAgo = Date.now() - 2 * ONE_HOUR_MS;
    expect(strategy.isValid(twoHoursAgo)).toBe(false);
  });
});

describe('MinutesCacheStrategy', () => {
  const strategy = new MinutesCacheStrategy();

  it('should have a TTL of 30 minutes', () => {
    expect(strategy.getTTL()).toBe(30 * ONE_MINUTE_MS);
  });

  it('should be valid for a timestamp cached now', () => {
    expect(strategy.isValid(Date.now())).toBe(true);
  });

  it('should be valid for a timestamp cached 10 minutes ago', () => {
    const tenMinutesAgo = Date.now() - 10 * ONE_MINUTE_MS;
    expect(strategy.isValid(tenMinutesAgo)).toBe(true);
  });

  it('should be invalid for a timestamp cached 31 minutes ago', () => {
    const thirtyOneMinutesAgo = Date.now() - 31 * ONE_MINUTE_MS;
    expect(strategy.isValid(thirtyOneMinutesAgo)).toBe(false);
  });
});

describe('InfiniteCacheStrategy', () => {
  const strategy = new InfiniteCacheStrategy();

  it('should have an Infinite TTL', () => {
    expect(strategy.getTTL()).toBe(Infinity);
  });

  it('should always be valid regardless of timestamp', () => {
    expect(strategy.isValid(Date.now())).toBe(true);
  });

  it('should be valid even for a very old timestamp', () => {
    const veryOldTimestamp = 0; // epoch
    expect(strategy.isValid(veryOldTimestamp)).toBe(true);
  });
});
