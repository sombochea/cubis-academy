# Database Setup Guide

## Fresh Database Setup

Since the payment system has been redesigned, follow these steps for a clean database setup:

### 1. Drop Existing Database (if needed)

```bash
# Using psql
psql -U your_user -c "DROP DATABASE IF EXISTS cubis_academy;"
psql -U your_user -c "CREATE DATABASE cubis_academy;"

# Or using Docker
docker exec your_postgres_container psql -U your_user -c "DROP DATABASE IF EXISTS cubis_academy;"
docker exec your_postgres_container psql -U your_user -c "CREATE DATABASE cubis_academy;"
```

### 2. Run Drizzle Migrations

```bash
# Generate migration from current schema
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Or push schema directly (for development)
pnpm drizzle-kit push
```

### 3. Verify Schema

```sql
-- Check payments table structure
\d payments

-- Should show:
-- id              | uuid
-- student_id      | uuid (not null)
-- enrollment_id   | uuid (not null)  ✅ Required
-- amount          | numeric(10,2)
-- method          | varchar(100)
-- status          | payment_status
-- txn_id          | varchar(255)
-- proof_url       | varchar(500)
-- notes           | text
-- created         | timestamp

-- Should NOT have:
-- course_id       ❌ Removed
```

### 4. Test Application

1. Start the application: `pnpm dev`
2. Create a student account
3. Enroll in a course
4. Make a payment
5. Verify payment appears with course name

## Key Schema Changes

### Payments Table

**What Changed**:
- ❌ Removed `course_id` column
- ✅ Made `enrollment_id` required (NOT NULL)
- ✅ Added cascade deletion on enrollment

**Why**:
- Single source of truth (no ambiguity)
- Better data integrity
- Simpler queries
- Industry standard pattern

### Workflow

```
Student → Browse Courses
       ↓
       Enroll (creates enrollment record)
       ↓
       Make Payment (requires enrollment_id)
       ↓
       Admin Approves (updates enrollment.paid_amount)
```

## Common Commands

```bash
# Generate new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm drizzle-kit push

# Open Drizzle Studio
pnpm db:studio

# Reset database (drop all tables)
pnpm drizzle-kit drop
```

## Troubleshooting

### Issue: "column course_id does not exist"

**Solution**: Old code still references `courseId`. All code has been updated, but if you see this error:
1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server: `pnpm dev`

### Issue: "null value in column enrollment_id violates not-null constraint"

**Solution**: Payment creation requires `enrollmentId`. Ensure:
1. Student is enrolled in the course first
2. Payment form includes `enrollmentId` parameter
3. Payment is accessed from enrollment details page

### Issue: Payments show "General Payment"

**Solution**: This should no longer happen. If it does:
1. Check that payment has `enrollment_id`
2. Verify enrollment exists and has `course_id`
3. Check query uses INNER JOIN (not LEFT JOIN)

## Database Indexes

The following indexes are automatically created:

- `payments_student_id_idx` - Fast student payment lookup
- `payments_enrollment_id_idx` - Fast enrollment payment lookup
- `payments_status_idx` - Filter by payment status
- `payments_created_idx` - Sort by date
- `payments_student_created_idx` - Student payment history (composite)

## Best Practices

1. **Always enroll before payment**: Create enrollment record first
2. **Use enrollment_id**: Never try to create payment without it
3. **Partial payments**: Multiple payments can link to same enrollment
4. **Re-enrollment**: Create new enrollment for same course (separate payment tracking)

## Related Documentation

- `payment-system-redesign.md` - Full design rationale and benefits
- `enrollment-payment-fix.md` - Original issue that led to redesign
- `database-schema.md` - Complete database schema reference
