# Date Utilities Documentation

## Overview

Centralized date parsing and formatting utilities using date-fns. All date operations in the application MUST use these utilities instead of native JavaScript Date methods.

## Location

`lib/utils/date.ts`

## Why Use These Utilities?

### Problems with Native Date Methods

❌ **Inconsistent formatting** across the codebase
❌ **No null safety** - crashes on null/undefined
❌ **Locale handling** is verbose and error-prone
❌ **Type safety** issues with various input types
❌ **Maintenance nightmare** when format changes needed

### Benefits of Date Utilities

✅ **Consistent formatting** - single source of truth
✅ **Null-safe** - handles null/undefined gracefully
✅ **Locale-aware** - supports multiple languages
✅ **Type-safe** - accepts Date, string, number, null, undefined
✅ **Easy maintenance** - change format in one place
✅ **Powered by date-fns** - battle-tested library

## Available Functions

### 1. `parseDate(value)`

Parse various input types into a Date object.

**Parameters:**
- `value`: Date | string | number | null | undefined

**Returns:** Date | null

**Example:**
```typescript
import { parseDate } from '@/lib/utils/date';

parseDate(new Date());           // Date object
parseDate("2025-01-15");         // Date object
parseDate(1705315800000);        // Date object
parseDate(null);                 // null
parseDate(undefined);            // null
```

### 2. `formatDateTime(value, locale)`

Format date with time (e.g., "Jan 15, 2025, 10:30 AM")

**Parameters:**
- `value`: Date | string | number | null | undefined
- `locale`: string (default: 'en')

**Returns:** string | null

**Example:**
```typescript
import { formatDateTime } from '@/lib/utils/date';

formatDateTime(payment.created, 'en');
// Output: "Jan 15, 2025, 10:30 AM"

formatDateTime(payment.created, 'km');
// Output: Khmer formatted date
```

### 3. `formatDate(value, locale)`

Format date without time (e.g., "Jan 15, 2025")

**Parameters:**
- `value`: Date | string | number | null | undefined
- `locale`: string (default: 'en')

**Returns:** string | null

**Example:**
```typescript
import { formatDate } from '@/lib/utils/date';

formatDate(enrollment.enrolled, 'en');
// Output: "Jan 15, 2025"
```

### 4. `formatDateLong(value, locale)`

Format date with full month name (e.g., "January 15, 2025")

**Parameters:**
- `value`: Date | string | number | null | undefined
- `locale`: string (default: 'en')

**Returns:** string | null

**Example:**
```typescript
import { formatDateLong } from '@/lib/utils/date';

formatDateLong(student.dob, 'en');
// Output: "January 15, 2025"
```

### 5. `formatDateTimeLong(value, locale)`

Format date with full month and time (e.g., "January 15, 2025, 10:30 AM")

**Parameters:**
- `value`: Date | string | number | null | undefined
- `locale`: string (default: 'en')

**Returns:** string | null

**Example:**
```typescript
import { formatDateTimeLong } from '@/lib/utils/date';

formatDateTimeLong(new Date(), 'en');
// Output: "January 15, 2025, 10:30 AM"
```

### 6. `formatTime(value, locale)`

Format time only (e.g., "10:30 AM")

**Parameters:**
- `value`: Date | string | number | null | undefined
- `locale`: string (default: 'en')

**Returns:** string | null

**Example:**
```typescript
import { formatTime } from '@/lib/utils/date';

formatTime(schedule.startTime, 'en');
// Output: "10:30 AM"
```

### 7. `formatDateShort(value)`

Format date for tables (e.g., "01/15/2025")

**Parameters:**
- `value`: Date | string | number | null | undefined

**Returns:** string | null

**Example:**
```typescript
import { formatDateShort } from '@/lib/utils/date';

formatDateShort(payment.created);
// Output: "01/15/2025"
```

### 8. `formatDateTimeShort(value)`

Format date and time for tables (e.g., "01/15/2025 10:30 AM")

**Parameters:**
- `value`: Date | string | number | null | undefined

**Returns:** string | null

**Example:**
```typescript
import { formatDateTimeShort } from '@/lib/utils/date';

formatDateTimeShort(log.timestamp);
// Output: "01/15/2025 10:30 AM"
```

### 9. `formatDateISO(value)`

Format date as ISO string (e.g., "2025-01-15")

**Parameters:**
- `value`: Date | string | number | null | undefined

**Returns:** string | null

**Example:**
```typescript
import { formatDateISO } from '@/lib/utils/date';

formatDateISO(new Date());
// Output: "2025-01-15"
```

### 10. `formatDateCustom(value, pattern, locale)`

Format date with custom pattern

**Parameters:**
- `value`: Date | string | number | null | undefined
- `pattern`: string (date-fns format pattern)
- `locale`: string (default: 'en')

**Returns:** string | null

**Example:**
```typescript
import { formatDateCustom } from '@/lib/utils/date';

formatDateCustom(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en');
// Output: "2025-01-15 10:30:45"
```

## Usage Guidelines

### DO ✅

```typescript
// Import utilities
import { formatDate, formatDateTime } from '@/lib/utils/date';

// Use in components
<p>{formatDate(payment.created, locale) || '-'}</p>
<p>{formatDateTime(enrollment.enrolled, locale) || 'N/A'}</p>

// Handle null values
const displayDate = formatDate(user.dob, locale) || 'Not provided';

// Use in data tables
{
  accessorKey: 'created',
  header: 'Created',
  cell: ({ row }) => formatDate(row.original.created, locale),
}
```

### DON'T ❌

```typescript
// ❌ Don't use native methods
new Date(payment.created).toLocaleDateString();
new Date(payment.created).toLocaleString(locale, { ... });

// ❌ Don't format inline
{new Date(payment.created).toLocaleDateString()}

// ❌ Don't handle null manually
{payment.created ? new Date(payment.created).toLocaleDateString() : '-'}
```

## Common Patterns

### 1. Display Date in UI

```typescript
import { formatDate } from '@/lib/utils/date';

<p className="text-sm text-gray-600">
  {formatDate(enrollment.enrolled, locale) || '-'}
</p>
```

### 2. Display Date with Time

```typescript
import { formatDateTime } from '@/lib/utils/date';

<p className="text-xs text-gray-500">
  {formatDateTime(payment.created, locale) || 'N/A'}
</p>
```

### 3. Data Table Column

```typescript
import { formatDate } from '@/lib/utils/date';

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'created',
    header: 'Date',
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.original.created, locale) || '-'}
      </div>
    ),
  },
];
```

### 4. Timeline Events

```typescript
import { formatDateTime } from '@/lib/utils/date';

<div className="space-y-4">
  <div>
    <p className="font-medium">Payment Created</p>
    <p className="text-xs text-gray-500">
      {formatDateTime(payment.created, locale)}
    </p>
  </div>
  {payment.approvedAt && (
    <div>
      <p className="font-medium text-green-700">Payment Approved</p>
      <p className="text-xs text-gray-500">
        {formatDateTime(payment.approvedAt, locale)}
      </p>
    </div>
  )}
</div>
```

### 5. Print/PDF Documents

```typescript
import { formatDateLong, formatDateTimeLong } from '@/lib/utils/date';

<div>
  <p>Payment Date: {formatDateLong(payment.created, locale)}</p>
  <p>Generated: {formatDateTimeLong(new Date(), locale)}</p>
</div>
```

## Locale Support

Currently supported locales:
- `en` - English (default)
- `km` - Khmer

The utilities automatically use the appropriate date-fns locale based on the locale parameter.

## Error Handling

All functions include try-catch blocks and return `null` on error. This prevents crashes and allows graceful fallbacks:

```typescript
// If date parsing fails, returns null
const date = formatDate(invalidValue, locale);
// Use with fallback
<p>{date || 'Invalid date'}</p>
```

## Migration Guide

### Before (Old Code)

```typescript
// ❌ Old way
<p>{new Date(payment.created).toLocaleDateString()}</p>
<p>{new Date(payment.created).toLocaleString(locale, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})}</p>
```

### After (New Code)

```typescript
// ✅ New way
import { formatDate, formatDateTime } from '@/lib/utils/date';

<p>{formatDate(payment.created, locale) || '-'}</p>
<p>{formatDateTime(payment.created, locale) || '-'}</p>
```

## Testing

```typescript
import { formatDate, formatDateTime, parseDate } from '@/lib/utils/date';

// Test parsing
expect(parseDate('2025-01-15')).toBeInstanceOf(Date);
expect(parseDate(null)).toBeNull();
expect(parseDate(undefined)).toBeNull();

// Test formatting
expect(formatDate('2025-01-15', 'en')).toBe('Jan 15, 2025');
expect(formatDateTime(null, 'en')).toBeNull();
```

## Future Enhancements

- [ ] Add relative time formatting (e.g., "2 hours ago")
- [ ] Add date range formatting
- [ ] Add calendar-specific formatting
- [ ] Add more locale support
- [ ] Add timezone handling

## Related Files

- `lib/utils/date.ts` - Main utility file
- `.kiro/steering/project-standards.md` - Project standards
- `package.json` - date-fns dependency

## Status

✅ **IMPLEMENTED** - Ready for use across the codebase

## Notes

- All date utilities use date-fns v4+
- Null safety is built-in
- Locale parameter is optional (defaults to 'en')
- All functions return null on error (never throw)
- Use with fallback values for better UX: `formatDate(value, locale) || '-'`
