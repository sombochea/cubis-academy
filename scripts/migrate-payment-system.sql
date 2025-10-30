-- Payment System Migration Script
-- This script migrates from dual foreign keys (enrollment_id + course_id) to single source of truth (enrollment_id only)

-- IMPORTANT: Run analyze-payment-data.sql first to understand your data!
-- IMPORTANT: Backup your database before running this migration!

BEGIN;

-- Step 1: Create enrollments for orphaned payments (payments with course_id but no enrollment_id)
-- This ensures every payment has an enrollment
INSERT INTO enrollments (student_id, course_id, status, total_amount, paid_amount, enrolled)
SELECT DISTINCT
  p.student_id,
  p.course_id,
  'active' as status,
  c.price as total_amount,
  COALESCE(
    (SELECT SUM(CAST(amount AS DECIMAL)) 
     FROM payments 
     WHERE student_id = p.student_id 
       AND course_id = p.course_id 
       AND status = 'completed'
       AND enrollment_id IS NULL
    ), 0
  ) as paid_amount,
  MIN(p.created) as enrolled
FROM payments p
INNER JOIN courses c ON p.course_id = c.id
WHERE p.enrollment_id IS NULL 
  AND p.course_id IS NOT NULL
GROUP BY p.student_id, p.course_id, c.price
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Step 2: Link orphaned payments to their enrollments
UPDATE payments p
SET enrollment_id = e.id
FROM enrollments e
WHERE p.enrollment_id IS NULL 
  AND p.course_id IS NOT NULL
  AND e.student_id = p.student_id
  AND e.course_id = p.course_id;

-- Step 3: Verify all payments now have enrollment_id
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM payments
  WHERE enrollment_id IS NULL;
  
  IF orphaned_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % payments still have no enrollment_id', orphaned_count;
  END IF;
  
  RAISE NOTICE 'Success: All payments now have enrollment_id';
END $$;

-- Step 4: Drop the course_id column from payments table
ALTER TABLE payments DROP COLUMN IF EXISTS course_id;

-- Step 5: Make enrollment_id NOT NULL
ALTER TABLE payments ALTER COLUMN enrollment_id SET NOT NULL;

-- Step 6: Remove the old index on course_id (if it exists)
DROP INDEX IF EXISTS payments_course_id_idx;

-- Step 7: Verify final state
SELECT 
  'Migration Complete' as status,
  COUNT(*) as total_payments,
  COUNT(DISTINCT enrollment_id) as unique_enrollments,
  COUNT(DISTINCT student_id) as unique_students
FROM payments;

COMMIT;

-- Rollback command (if needed):
-- ROLLBACK;
