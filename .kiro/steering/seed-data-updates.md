# Seed Data Updates

## Changes Made

### Fixed Payment System Integration

**Issue**: Seed file was using old payment schema with `courseId` field.

**Solution**: Updated to use new enrollment-only payment system.

### Key Changes

1. **Added course categories table**
   - Created 6 course categories with proper structure
   - Each category has: name, slug, description, icon, color
   - Courses now use `categoryId` (foreign key) instead of string

2. **Removed `courseId` from payments**
   - Payments now only use `enrollmentId`
   - Course information accessed via enrollment relationship

3. **Added enrollment payment tracking**
   - Set `totalAmount` on enrollments (course price)
   - Set `paidAmount` on enrollments (amount paid)
   - Demonstrates partial payment tracking

4. **Enhanced payment scenarios**
   - **Full payments**: Single transaction for full amount
   - **Partial payments**: 50% paid, balance outstanding
   - **Multiple installments**: 3 payments (40%, 30%, 30%)
   - **Pending payments**: Awaiting admin approval

5. **Added delivery modes**
   - Online courses (with YouTube/Zoom links)
   - Face-to-face courses (with physical locations)
   - Hybrid courses (both online and in-person)

6. **Realistic payment methods**
   - `bank_transfer`
   - `credit_card`
   - `mobile_payment`
   - `cash`

## Demo Data Overview

### Users
- 1 Admin
- 4 Teachers (various specializations)
- 6 Students

### Course Categories
- 6 categories with icons and colors
- Web Development, UX/UI Design, DevOps, Programming, Data Science, Mobile Development
- Each with slug, description, and visual styling

### Courses
- 6 courses linked to categories via `categoryId`
- Various levels (beginner, intermediate, advanced)
- Various delivery modes (online, face-to-face, hybrid)
- Prices ranging from $299.99 to $599.99

### Enrollments
- 9 enrollments with varied progress
- Mix of active and completed statuses

### Payments
- ~15+ payment records
- Demonstrates all payment scenarios
- Includes pending payments for testing approval flow

### Other Data
- 5 score records
- Multiple attendance records (5 days × 5 students)

## Running the Seed

```bash
# Drop and recreate database
pnpm db:drop
pnpm db:push

# Run seed
pnpm db:seed
```

## Test Scenarios

### 1. Full Payment Flow
- Student: Bob Martinez
- Course: Full-Stack Web Development
- Status: Fully paid in single transaction

### 2. Partial Payment Flow
- Student: Alice Williams
- Course: Full-Stack Web Development
- Status: 50% paid, balance due
- Can test "Make Payment" for remaining amount

### 3. Multiple Installments
- Student: Carol Brown
- Course: UX/UI Design Fundamentals
- Status: Fully paid via 3 installments
- Shows payment history with multiple transactions

### 4. Pending Payment
- Student: Alice Williams
- Additional payment pending approval
- Admin can approve/reject

## Login Credentials

All users have password: `123456`

- **Admin**: admin@cubisacademy.com
- **Teacher**: john@cubisacademy.com
- **Student**: alice@example.com

## Benefits

1. **Realistic Demo**: Shows real-world payment scenarios
2. **Testing**: Covers all payment flows
3. **Partial Payments**: Demonstrates installment capability
4. **Admin Workflow**: Pending payments for approval testing
5. **Data Integrity**: All payments properly linked to enrollments

## Notes

- All payments are linked to enrollments (no orphaned payments)
- Payment amounts match course prices
- Enrollment `paidAmount` reflects completed payments
- Demonstrates the enrollment-first payment model
