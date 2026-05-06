import {
  formatPhoneNumber,
  stripFormatting,
  formatDuration,
  formatRelativeTime,
} from '../services/PhoneNumberFormatter';

describe('formatPhoneNumber — US numbers (happy path)', () => {
  it('formats progressively as the user types', () => {
    expect(formatPhoneNumber('5')).toBe('(5');
    expect(formatPhoneNumber('555')).toBe('(555');
    expect(formatPhoneNumber('5551')).toBe('(555) 1');
    expect(formatPhoneNumber('555123')).toBe('(555) 123');
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('formats a 10-digit number with various punctuation', () => {
    expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('(555) 123 4567')).toBe('(555) 123-4567');
    expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
  });
});

describe('formatPhoneNumber — country codes', () => {
  it('formats US country code 1 with +1 prefix', () => {
    expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
  });

  it('formats international (non-US) numbers as space-grouped digits', () => {
    expect(formatPhoneNumber('+442079460000')).toBe('+442 079 460 000');
  });
});

describe('formatPhoneNumber — edge cases', () => {
  it('returns empty string for empty / non-digit input', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber('abc')).toBe('');
    expect(formatPhoneNumber('---')).toBe('');
  });

  it('strips letters but keeps digits (mixed input)', () => {
    // After stripping letters: "1800" → US-with-country-code branch, "800" formatted.
    // At 3 digits the formatter intentionally omits the closing paren (still typing).
    expect(formatPhoneNumber('1-800-FLOWERS')).toBe('+1 (800');
  });
});

describe('stripFormatting', () => {
  it('removes all non-digit characters', () => {
    expect(stripFormatting('(555) 123-4567')).toBe('5551234567');
  });

  it('preserves leading +', () => {
    expect(stripFormatting('+1 (555) 123-4567')).toBe('+15551234567');
  });

  it('handles already-stripped numbers', () => {
    expect(stripFormatting('5551234567')).toBe('5551234567');
  });

  it('returns empty string when no digits present', () => {
    expect(stripFormatting('()-')).toBe('');
  });
});

describe('formatDuration', () => {
  it('formats seconds under one minute', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(7)).toBe('0:07');
    expect(formatDuration(45)).toBe('0:45');
  });

  it('formats minutes:seconds', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(599)).toBe('9:59');
  });

  it('formats hours:minutes:seconds at the hour boundary', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });

  it('returns 0:00 for negative input', () => {
    expect(formatDuration(-10)).toBe('0:00');
  });
});

describe('formatRelativeTime', () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Just now" for events within the last minute', () => {
    expect(formatRelativeTime(NOW)).toBe('Just now');
    expect(formatRelativeTime(NOW - 30_000)).toBe('Just now');
  });

  it('returns minutes ago for events within the last hour', () => {
    expect(formatRelativeTime(NOW - 5 * 60_000)).toBe('5m ago');
    expect(formatRelativeTime(NOW - 59 * 60_000)).toBe('59m ago');
  });

  it('returns hours ago for events within the last day', () => {
    expect(formatRelativeTime(NOW - 3 * 3_600_000)).toBe('3h ago');
    expect(formatRelativeTime(NOW - 23 * 3_600_000)).toBe('23h ago');
  });

  it('returns days ago for events within the last week', () => {
    expect(formatRelativeTime(NOW - 2 * 86_400_000)).toBe('2d ago');
    expect(formatRelativeTime(NOW - 6 * 86_400_000)).toBe('6d ago');
  });

  it('falls back to a calendar date for events older than a week', () => {
    const eightDaysAgo = NOW - 8 * 86_400_000;
    const formatted = formatRelativeTime(eightDaysAgo);
    // Don't assert exact locale formatting — just that we got a non-relative string.
    expect(formatted).not.toMatch(/ago|Just now/);
  });
});
