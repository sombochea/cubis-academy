# Payment & Feedback Features

## Overview

This document describes the partial payment system and course feedback features implemented for the CUBIS Academy LMS.

## 1. Course Delivery Modes

Courses can now be delivered in three modes:

### Delivery Mode Types

- **Online**: Fully online courses (YouTube, Zoom)
- **Face-to-Face**: In-person classes at physical locations
- **Hybrid**: Combination of online and face-to-face

### Database Schema

```typescript
deliveryMode: deliveryModeEnum("delivery_mode")
  .notNull()
  .default("online")
location: text("location") // Physical location for face-to-face/hybrid
```

### Display

- Delivery mode shown with icons (Monitor for online, Users for face-to-face)
- Location displayed for face-to-face and hybrid courses
- Material links (YouTube/Zoom) available for online/hybrid courses

## 2. Partial Payment System

Students can now make partial payments for courses based on their financial ability.

### Database Schema

**Enrollments Table:**
```typescript
totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
  .notNull()
  .default("0") // Total course price at enrollment
paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
  .notNull()
  .default("0") // Total amount paid so far
```

**Payments Table:**
```typescript
enrollmentId: uuid("enrollment_id").references(() => enrollments.id)
proofUrl: varchar("proof_url", { length: 500 }) // Payment proof/receipt
status: 'pending' | 'completed' | 'failed' | 'refunded'
```

### Features

- **Multiple Payments**: Students can make multiple payments for a single enrollment
- **Payment Tracking**: Track total amount, paid amount, and remaining balance
- **Payment Progress**: Visual progress bar showing payment completion percentage
- **Payment History**: View all payments with status, method, and transaction details
- **Payment Proof**: Upload payment receipts/proof for verification

### Payment Flow

1. Student enrolls in course → `totalAmount` set to course price
2. Student makes payment → Payment record created with `enrollmentId`
3. Admin approves payment → `paidAmount` updated in enrollment
4. Student can make additional payments until fully paid

### Payment Summary Display

```
Total Amount:    $500.00
Paid Amount:     $300.00
Remaining:       $200.00
Payment Progress: 60%
```

## 3. Course Feedback System

Students can provide feedback and ratings for courses they're enrolled in.

### Database Schema

```typescript
export const courseFeedback = pgTable("course_feedback", {
  id: uuid("id").primaryKey(),
  enrollmentId: uuid("enrollment_id").notNull(), // One feedback per enrollment
  studentId: uuid("student_id").notNull(),
  courseId: uuid("course_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").default(false),
  created: timestamp("created").notNull(),
  updated: timestamp("updated").notNull(),
});
```

### Features

- **Star Rating**: 1-5 star rating system with visual stars
- **Written Feedback**: Optional text comment
- **Anonymous Option**: Students can submit feedback anonymously
- **One Per Enrollment**: Each enrollment can have one feedback (can be updated)
- **Edit Feedback**: Students can update their feedback after submission

### Feedback Form

- Interactive star rating with hover effects
- Text area for detailed comments
- Checkbox for anonymous submission
- Success message after submission
- Update existing feedback

### API Endpoints

- `POST /api/course-feedback` - Submit new feedback
- `PUT /api/course-feedback` - Update existing feedback

## 4. Enrollment Details Page Updates

The enrollment details page now shows:

### Course Information
- Delivery mode (Online/Face-to-Face/Hybrid)
- Physical location (for face-to-face/hybrid)
- Material links (YouTube/Zoom)

### Stats Dashboard (5 cards)
1. **Progress**: Course completion percentage
2. **Average Score**: Average of all scores
3. **Attendance**: Attendance rate percentage
4. **Classes**: Total number of classes
5. **Paid**: Payment completion percentage

### Sections
1. **Scores**: Assessment scores with titles and remarks
2. **Attendance**: Attendance records with status
3. **Payment History**: All payments with status and details
4. **Course Feedback**: Feedback form or existing feedback

## 5. Implementation Details

### Payment Integration

When creating a payment for an enrollment:

```typescript
// Link payment to enrollment
enrollmentId: enrollment.id

// Admin approves payment
await db.update(enrollments)
  .set({
    paidAmount: sql`${enrollments.paidAmount} + ${payment.amount}`
  })
  .where(eq(enrollments.id, enrollmentId));
```

### Feedback Validation

- Rating required (1-5)
- Comment optional
- One feedback per enrollment (unique constraint)
- Only enrolled students can submit feedback

### Security

- Students can only view/edit their own enrollments
- Students can only submit feedback for their enrollments
- Payment verification by admin before updating `paidAmount`

## 6. User Experience

### For Students

1. **Enroll in Course**: See delivery mode and location
2. **Make Initial Payment**: Submit partial payment with proof
3. **Access Materials**: View course materials based on delivery mode
4. **Track Progress**: Monitor learning progress and payment status
5. **Make Additional Payments**: Pay remaining balance over time
6. **Submit Feedback**: Rate and review course after enrollment

### For Admins

1. **Review Payments**: Approve/reject payment submissions
2. **Update Payment Status**: Mark payments as completed
3. **Track Enrollments**: Monitor payment completion
4. **View Feedback**: See course ratings and reviews

## 7. Future Enhancements

- Payment reminders for outstanding balances
- Payment plans with scheduled installments
- Aggregate course ratings on course cards
- Feedback moderation system
- Payment gateway integration (Stripe, PayPal)
- Automatic payment approval for verified methods

## 8. Database Migrations

Migration file: `0005_demonic_spyke.sql`

Changes:
- Added `delivery_mode` enum and field to courses
- Added `location` field to courses
- Added `totalAmount` and `paidAmount` to enrollments
- Added `enrollmentId` and `proofUrl` to payments
- Added `refunded` status to payment_status enum
- Created `course_feedback` table with indexes
- Added relations for feedback

Status: ✅ Applied to database
