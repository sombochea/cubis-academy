# Enrollment Payment Fix

## Issue

When students clicked "Make Payment" from their enrollment details page, the payment form didn't properly load the enrollment information. This caused payments to be marked as "General Payment" instead of being linked to the specific enrollment.

## Root Cause

1. **Missing API Endpoint**: The PaymentForm component was trying to fetch enrollment details from `/api/enrollments/[id]/payment-details`, but this endpoint didn't exist.

2. **Incorrect Query Joins**: The payments list query was joining courses directly via `payments.courseId`, but for enrollment-linked payments, it should get the course from `enrollments.courseId`.

## Solution

### 1. Created Enrollment Payment Details API

**File**: `app/api/enrollments/[id]/payment-details/route.ts`

**Features**:
- Returns enrollment payment information (totalAmount, paidAmount, courseTitle, courseCategory)
- Validates that the enrollment belongs to the requesting student
- Provides data for the payment form preview

**Endpoint**: `GET /api/enrollments/[id]/payment-details`

**Response**:
```json
{
  "totalAmount": "500.00",
  "paidAmount": "200.00",
  "courseTitle": "Web Development Fundamentals",
  "courseCategory": "programming"
}
```

### 2. Fixed Payment List Query

**File**: `app/[locale]/(student)/student/payments/page.tsx`

**Changes**:
- Updated query to properly join courses based on payment type
- For enrollment payments: Get course from `enrollments.courseId`
- For direct payments: Get course from `payments.courseId`
- Uses CASE statements to select the correct course information

**Before**:
```typescript
.leftJoin(courses, eq(payments.courseId, courses.id))
.leftJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
```

**After**:
```typescript
.leftJoin(enrollments, eq(payments.enrollmentId, enrollments.id))
.leftJoin(courses, eq(enrollments.courseId, courses.id))
.leftJoin(sql`${courses.getSQL()} as direct_course`, sql`${payments.courseId} = direct_course.id`)
```

### 3. Fixed Payment Details Query

**File**: `app/[locale]/(student)/student/payments/[id]/page.tsx`

**Changes**:
- Same fix as payment list query
- Ensures payment details page shows correct course information
- Properly displays enrollment payment status

## User Flow (Fixed)

1. **Student views enrollment details**
   - Sees outstanding balance alert
   - Clicks "Make Payment" button

2. **Payment form loads**
   - URL includes: `?enrollmentId={id}&amount={remaining}&courseName={title}`
   - Form fetches enrollment details via API
   - Shows course information in sidebar
   - Displays payment progress (paid/total/remaining)
   - Pre-fills suggested amount

3. **Student submits payment**
   - Payment is created with `enrollmentId` link
   - Status set to "pending"
   - Admin can approve/reject

4. **Payment appears in history**
   - Shows correct course name (not "General Payment")
   - Links to enrollment
   - Displays payment progress

## Payment Types

### Enrollment Payment
- Has `enrollmentId` set
- Linked to specific course enrollment
- Shows course name in payment history
- Counts toward enrollment's `paidAmount`
- Displays payment progress

### General Payment
- Has `courseId` only (no `enrollmentId`)
- Not linked to enrollment
- Shows course name if `courseId` provided
- Shows "General Payment" if no course
- Used for non-enrollment payments

## Benefits

1. **Clear Payment Tracking**: Students see which course each payment is for
2. **Payment Progress**: Visual progress bars show payment completion
3. **Partial Payments**: Students can pay any amount toward enrollment
4. **Better UX**: Pre-filled forms reduce friction
5. **Accurate Records**: Payments properly linked to enrollments

## Testing Checklist

- [x] API endpoint returns correct enrollment details
- [x] Payment form loads enrollment information
- [x] Payment form shows payment progress
- [x] Payment submission links to enrollment
- [x] Payment list shows correct course names
- [x] Payment details page shows correct information
- [x] Outstanding balance alerts work correctly
- [x] "Make Payment" button passes correct parameters

## Files Created

1. `app/api/enrollments/[id]/payment-details/route.ts` - New API endpoint

## Files Modified

1. `app/[locale]/(student)/student/payments/page.tsx` - Fixed query joins
2. `app/[locale]/(student)/student/payments/[id]/page.tsx` - Fixed query joins

## Database Schema (No Changes)

The existing schema already supports this functionality:

```typescript
payments {
  enrollmentId: uuid | null  // Links to enrollment
  courseId: uuid | null      // Direct course link (for general payments)
}

enrollments {
  totalAmount: decimal       // Course price at enrollment
  paidAmount: decimal        // Total paid so far
}
```

## Status

✅ **FIXED** - Enrollment payments now properly display course information and link to enrollments.

## Future Enhancements

- [ ] Auto-update `paidAmount` when payment is approved (currently manual)
- [ ] Email notifications when payment is approved/rejected
- [ ] Payment reminders for outstanding balances
- [ ] Payment plans with scheduled installments
- [ ] Receipt generation and download
