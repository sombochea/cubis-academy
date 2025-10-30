# Payment Query Fixes

## Issue

After removing `courseId` from the payments table, several queries were still trying to join courses directly via `payments.courseId`, causing SQL errors.

## Error Message

```
Failed query: select ... from "payments" inner join "courses" on  = "courses"."id"
```

The empty join condition (`on  = "courses"."id"`) indicated that `payments.courseId` no longer exists.

## Files Fixed

### 1. Student Dashboard
**File**: `app/[locale]/(student)/student/page.tsx`

**Before**:
```typescript
.from(payments)
.innerJoin(courses, eq(payments.courseId, courses.id))
```

**After**:
```typescript
.from(payments)
.innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
.innerJoin(courses, eq(enrollments.courseId, courses.id))
```

### 2. Admin Payments List
**File**: `app/[locale]/(admin)/admin/payments/page.tsx`

**Before**:
```typescript
.from(payments)
.innerJoin(students, eq(payments.studentId, students.userId))
.innerJoin(users, eq(students.userId, users.id))
.leftJoin(courses, eq(payments.courseId, courses.id))
```

**After**:
```typescript
.from(payments)
.innerJoin(students, eq(payments.studentId, students.userId))
.innerJoin(users, eq(students.userId, users.id))
.innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
.innerJoin(courses, eq(enrollments.courseId, courses.id))
```

**Also added**: `enrollments` to imports

### 3. Admin Payment Details
**File**: `app/[locale]/(admin)/admin/payments/[id]/page.tsx`

**Before**:
```typescript
.from(payments)
.innerJoin(students, eq(payments.studentId, students.userId))
.innerJoin(users, eq(students.userId, users.id))
.leftJoin(courses, eq(payments.courseId, courses.id))
```

**After**:
```typescript
.from(payments)
.innerJoin(students, eq(payments.studentId, students.userId))
.innerJoin(users, eq(students.userId, users.id))
.innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
.innerJoin(courses, eq(enrollments.courseId, courses.id))
```

**Also added**: `enrollments` to imports

## Pattern

All payment queries that need course information must now follow this pattern:

```typescript
db.select(...)
  .from(payments)
  .innerJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
  .innerJoin(courses, eq(enrollments.courseId, courses.id))
```

## Queries That Don't Need Changes

These queries don't need course information, so they remain unchanged:

1. **Aggregate queries** (SUM, COUNT):
   ```typescript
   db.select({ total: sql`SUM(${payments.amount})` })
     .from(payments)
     .where(eq(payments.status, 'completed'))
   ```

2. **Enrollment-specific queries**:
   ```typescript
   db.select(...)
     .from(payments)
     .where(eq(payments.enrollmentId, enrollmentId))
   ```

## Verification

All queries now:
- ✅ Use `payments.enrollmentId` (required field)
- ✅ Join through enrollments to get course data
- ✅ Follow single source of truth pattern
- ✅ Have proper imports for `enrollments` table

## Testing

Test these scenarios:
1. ✅ Student dashboard loads without errors
2. ✅ Recent payments show course names
3. ✅ Admin payments list displays correctly
4. ✅ Admin payment details page works
5. ✅ All payment queries return course information

## Status

✅ **FIXED** - All payment queries updated to use enrollment-based joins.
