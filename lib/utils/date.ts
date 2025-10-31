/**
 * Date Utility Functions
 *
 * Centralized date parsing and formatting using date-fns.
 * Handles various input types (Date, string, number, null, undefined).
 * Provides consistent date formatting across the application.
 */

import { format, parseISO, isValid } from "date-fns";
import { enUS, km } from "date-fns/locale";

/**
 * Get date-fns locale object from locale string
 */
function getDateFnsLocale(locale: string) {
  switch (locale) {
    case "km":
      return km;
    case "en":
    default:
      return enUS;
  }
}

/**
 * Parse various date input types into a Date object
 *
 * @param value - Date, string (ISO), number (timestamp), null, or undefined
 * @returns Date object or null if invalid
 */
export function parseDate(
  value: Date | string | number | null | undefined
): Date | null {
  if (!value) return null;

  try {
    // Already a Date object
    if (value instanceof Date) {
      return isValid(value) ? value : null;
    }

    // ISO string
    if (typeof value === "string") {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : null;
    }

    // Timestamp (number)
    if (typeof value === "number") {
      const parsed = new Date(value);
      return isValid(parsed) ? parsed : null;
    }

    return null;
  } catch (error) {
    console.error("Date parsing error:", error);
    return null;
  }
}

/**
 * Format date with time (e.g., "Jan 15, 2025, 10:30 AM")
 *
 * @param value - Date, string, number, null, or undefined
 * @param locale - Locale string ('en' or 'km')
 * @returns Formatted date string or null
 */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  locale: string = "en"
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "MMM d, yyyy, h:mm a", {
      locale: getDateFnsLocale(locale),
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format date without time (e.g., "Jan 15, 2025")
 *
 * @param value - Date, string, number, null, or undefined
 * @param locale - Locale string ('en' or 'km')
 * @returns Formatted date string or null
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  locale: string = "en"
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "MMM d, yyyy", {
      locale: getDateFnsLocale(locale),
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format date with full month name (e.g., "January 15, 2025")
 *
 * @param value - Date, string, number, null, or undefined
 * @param locale - Locale string ('en' or 'km')
 * @returns Formatted date string or null
 */
export function formatDateLong(
  value: Date | string | number | null | undefined,
  locale: string = "en"
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "MMMM d, yyyy", {
      locale: getDateFnsLocale(locale),
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format date with full month name and time (e.g., "January 15, 2025, 10:30 AM")
 *
 * @param value - Date, string, number, null, or undefined
 * @param locale - Locale string ('en' or 'km')
 * @returns Formatted date string or null
 */
export function formatDateTimeLong(
  value: Date | string | number | null | undefined,
  locale: string = "en"
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "MMMM d, yyyy, h:mm a", {
      locale: getDateFnsLocale(locale),
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format time only (e.g., "10:30 AM")
 *
 * @param value - Date, string, number, null, or undefined
 * @param locale - Locale string ('en' or 'km')
 * @returns Formatted time string or null
 */
export function formatTime(
  value: Date | string | number | null | undefined,
  locale: string = "en"
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "h:mm a", {
      locale: getDateFnsLocale(locale),
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format date for display in tables (e.g., "01/15/2025")
 *
 * @param value - Date, string, number, null, or undefined
 * @returns Formatted date string or null
 */
export function formatDateShort(
  value: Date | string | number | null | undefined
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "MM/dd/yyyy");
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format date and time for display in tables (e.g., "01/15/2025 10:30 AM")
 *
 * @param value - Date, string, number, null, or undefined
 * @returns Formatted date string or null
 */
export function formatDateTimeShort(
  value: Date | string | number | null | undefined
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "MM/dd/yyyy h:mm a");
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format date for ISO string (e.g., "2025-01-15")
 *
 * @param value - Date, string, number, null, or undefined
 * @returns ISO date string or null
 */
export function formatDateISO(
  value: Date | string | number | null | undefined
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, "yyyy-MM-dd");
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

/**
 * Format date with custom pattern
 *
 * @param value - Date, string, number, null, or undefined
 * @param pattern - date-fns format pattern
 * @param locale - Locale string ('en' or 'km')
 * @returns Formatted date string or null
 */
export function formatDateCustom(
  value: Date | string | number | null | undefined,
  pattern: string,
  locale: string = "en"
): string | null {
  const date = parseDate(value);
  if (!date) return null;

  try {
    return format(date, pattern, {
      locale: getDateFnsLocale(locale),
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

export function formatDateRelative(date: Date, locale: string) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return formatDate(date, locale) || "-";
  }
}
