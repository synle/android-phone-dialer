/**
 * Phone number formatting utilities.
 *
 * In production, replace this with libphonenumber-js for proper
 * international formatting. This implementation handles US numbers
 * and provides a reasonable fallback for other formats.
 */

/**
 * Formats a phone number string for display as the user types.
 * Applies US formatting: (XXX) XXX-XXXX
 * Falls back to raw digits for non-US numbers.
 */
export function formatPhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) return '';

  // If starts with country code 1, format as US
  if (digits.startsWith('1') && digits.length > 1) {
    return formatUS(digits.substring(1), true);
  }

  // 10-digit US number without country code
  if (digits.length <= 10) {
    return formatUS(digits, false);
  }

  // International: just add spaces every 3-4 digits
  if (input.startsWith('+')) {
    return '+' + formatInternational(digits);
  }

  return formatInternational(digits);
}

function formatUS(digits: string, withCountryCode: boolean): string {
  const prefix = withCountryCode ? '+1 ' : '';
  const len = digits.length;

  if (len === 0) return prefix;
  if (len <= 3) return `${prefix}(${digits}`;
  if (len <= 6) return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `${prefix}(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function formatInternational(digits: string): string {
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    parts.push(digits.slice(i, i + 3));
  }
  return parts.join(' ');
}

/**
 * Strips all formatting from a phone number, leaving only digits and optional + prefix.
 */
export function stripFormatting(formatted: string): string {
  const hasPlus = formatted.startsWith('+');
  const digits = formatted.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Formats a duration in seconds to a human-readable string.
 * e.g., 65 -> "1:05", 3661 -> "1:01:01"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats a timestamp to a relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
