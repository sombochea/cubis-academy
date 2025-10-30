# Payments Management Documentation

## Overview

Comprehensive payments management system for tracking, approving, and managing all payment transactions in the academy.

## Features

### 1. Payments Dashboard with Stats
**Location**: `app/[locale]/(admin)/admin/payments/page.tsx`

**Stats Cards**:
- Total Revenue (completed payments sum)
- Pending Amount (pending payments sum)
- Completed Payments (count)
- Pending Payments (count)

**DataTable Features**:
- Search by student name
- Filter by status (Pending, Completed, Failed, Refunded)
- Filter by payment method (Cash, Bank Transfer, Credit Card, Mobile Payment)
- Sort by student name, amount, date
- Pagination (10/20/30/40/50 rows)
- Row numbering
- Column visibility toggle

**Columns**:
- Transaction ID (monospace font)
- Student (Name + SUID)
- Course Title (or "General Payment")
- Amount (formatted currency)
- Payment Method
- Status (color-coded badges)
- Date
- Actions (View, Approve, Reject)

### 2. Payment Details Page
**Location**: `app/[locale]/(admin)/admin/payments/[id]/page.tsx`

**Information Displayed**:
- Transaction ID
- Amount (large, prominent)
- Payment method
- Payment date
- Notes (if any)
- Proof of payment (attachment link)
- Student details with link
- Course details with link (if applicable)
- Status badge
- Timeline (created, updated)

**Actions Available**:
- Approve payment (for pending payments)
- Reject payment (for pending payments)
- View student profile
- View course details

### 3. Approve Payment
**Location**: `app/[locale]/(admin)/admin/payments/[id]/approve/page.tsx`

- Confirmation dialog
- Updates status to "completed"
- Updates timestamp
- Redirects to payment details

### 4. Reject Payment
**Location**: `app/[locale]/(admin)/admin/payments/[id]/reject/page.tsx`

- Confirmation dialog with reason input
- Requires rejection reason
- Updates status to "failed"
- Saves reason in notes field
- Updates timestamp
- Redirects to payment details

## Components

### PaymentsDataTable
**Location**: `components/admin/PaymentsDataTable.tsx`

Reusable DataTable component for displaying payments.

**Props**:
```typescript
{
  data: Payment[];
  locale: string;
}
```

**Features**:
- Sortable columns
- Dual filtering (status + method)
- Search by student name
- Conditional actions (approve/reject for pending)
- Currency formatting
- Color-coded status badges

### PaymentFilters
**Location**: `components/admin/PaymentFilters.tsx`

Filter component with two dropdowns.

**Status Options**:
- All Status
- Pending
- Completed
- Failed
- Refunded

**Method Options**:
- All Methods
- Cash
- Bank Transfer
- Credit Card
- Mobile Payment

## API Routes

### POST /api/payments/[id]/approve
**Location**: `app/api/payments/[id]/approve/route.ts`

Approves a pending payment.

**Authorization**: Admin only

**Actions**:
1. Updates status to "completed"
2. Updates timestamp

**Response**:
```json
{
  "success": true
}
```

### POST /api/payments/[id]/reject
**Location**: `app/api/payments/[id]/reject/route.ts`

Rejects a pending payment.

**Authorization**: Admin only

**Request Body**:
```json
{
  "reason": "Rejection reason text"
}
```

**Actions**:
1. Updates status to "failed"
2. Saves reason in notes field
3. Updates timestamp

**Response**:
```json
{
  "success": true
}
```

## Database Schema

### Payments Table
```sql
payments:
- id: UUID (PK)
- student_id: UUID (FK -> students.user_id)
- course_id: UUID (FK -> courses.id, nullable)
- amount: DECIMAL(10,2)
- method: VARCHAR (cash, bank_transfer, credit_card, mobile_payment)
- status: ENUM ('pending', 'completed', 'failed', 'refunded')
- txn_id: VARCHAR (nullable)
- notes: TEXT (nullable)
- proof_url: VARCHAR (nullable)
- created: TIMESTAMP
- updated: TIMESTAMP
```

## Payment Status Types

1. **Pending**: Payment submitted, awaiting admin approval
2. **Completed**: Payment approved and processed
3. **Failed**: Payment rejected or failed
4. **Refunded**: Payment was refunded to student

## Payment Methods

1. **Cash**: Physical cash payment
2. **Bank Transfer**: Direct bank transfer
3. **Credit Card**: Credit/debit card payment
4. **Mobile Payment**: Mobile wallet payment (ABA, Wing, etc.)

## Stats Calculation

### Total Revenue
```typescript
SUM(amount) WHERE status = 'completed'
```

### Pending Amount
```typescript
SUM(amount) WHERE status = 'pending'
```

### Completed Count
```typescript
COUNT(*) WHERE status = 'completed'
```

### Pending Count
```typescript
COUNT(*) WHERE status = 'pending'
```

## Actions Available

### From Payments List:
1. **View Details**: Navigate to payment details page
2. **View Student**: Navigate to student profile
3. **View Course**: Navigate to course details (if course payment)
4. **Approve**: Approve pending payment
5. **Reject**: Reject pending payment

### From Payment Details:
1. **Back to Payments**: Return to list
2. **Approve Payment**: Approve (if pending)
3. **Reject Payment**: Reject (if pending)
4. **View Student Profile**: Link to student page
5. **View Course Details**: Link to course page
6. **View Proof**: Open payment proof attachment

## Permissions

**Admin Only**:
- View all payments
- View payment details
- Approve payments
- Reject payments

**Future Enhancements**:
- Students: View their own payments
- Teachers: View payments for their courses

## UI/UX Features

1. **Color-Coded Status Badges**:
   - Pending: Yellow
   - Completed: Green
   - Failed: Red
   - Refunded: Gray

2. **Stats Cards with Gradients**:
   - Total Revenue: Green gradient
   - Pending Amount: Yellow gradient
   - Completed: Blue gradient
   - Pending Count: Purple gradient

3. **Currency Formatting**:
   - Always show 2 decimal places
   - Dollar sign prefix
   - Consistent formatting

4. **Responsive Design**:
   - Mobile-friendly table
   - Stacked stats on mobile
   - Touch-friendly buttons

5. **Loading States**:
   - Button spinners
   - Smooth transitions
   - Disabled states

6. **Empty States**:
   - "No payments found" message
   - Clear call-to-action

## Workflow

### Payment Approval Flow:
1. Student submits payment (manual entry)
2. Payment status: "pending"
3. Admin reviews payment details
4. Admin checks proof of payment
5. Admin approves or rejects
6. Status updated to "completed" or "failed"
7. Student notified (future enhancement)

### Payment Rejection Flow:
1. Admin clicks "Reject"
2. Admin enters rejection reason
3. Status updated to "failed"
4. Reason saved in notes
5. Student can view reason (future enhancement)

## Internationalization

All text is wrapped with `<Trans>` for i18n support.

**Supported Languages**:
- Khmer (km)
- English (en)

## Best Practices

1. **Always verify payment proof** before approving
2. **Provide clear rejection reasons** for transparency
3. **Track all status changes** with timestamps
4. **Show comprehensive stats** for financial overview
5. **Link to related entities** (student, course)
6. **Handle edge cases** (no course, no proof)
7. **Validate permissions** on all actions

## Future Enhancements

1. **Bulk Actions**: Approve/reject multiple payments
2. **Export**: Export payment data to CSV/Excel
3. **Refund Processing**: Handle refund requests
4. **Email Notifications**: Notify students of status changes
5. **Payment Gateway**: Integrate online payment
6. **Receipt Generation**: Auto-generate payment receipts
7. **Analytics**: Payment trends and reports
8. **Filters**: Date range, amount range filters
9. **Search**: Search by transaction ID
10. **Audit Log**: Track all payment status changes

## Security Considerations

1. **Admin-Only Access**: All payment management requires admin role
2. **Validation**: All inputs validated on server
3. **Audit Trail**: Timestamps track all changes
4. **Proof Storage**: Secure storage for payment proofs
5. **Transaction IDs**: Unique identifiers for tracking

## Testing Checklist

- [ ] View payments list with filters
- [ ] Search by student name
- [ ] Filter by status
- [ ] Filter by payment method
- [ ] Sort by different columns
- [ ] View payment details
- [ ] Approve pending payment
- [ ] Reject pending payment with reason
- [ ] View student from payment
- [ ] View course from payment
- [ ] Check stats calculations
- [ ] Test responsive design
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test permissions (non-admin)
