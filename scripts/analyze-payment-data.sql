-- Payment Data Analysis Script
-- Run this to understand current payment data before migration

-- 1. Check total payments
SELECT 
  'Total Payments' as metric,
  COUNT(*) as count
FROM payments;

-- 2. Check payments with enrollmentId
SELECT 
  'Payments with enrollmentId' as metric,
  COUNT(*) as count
FROM payments 
WHERE enrollment_id IS NOT NULL;

-- 3. Check payments with courseId only (orphaned)
SELECT 
  'Payments with courseId only (orphaned)' as metric,
  COUNT(*) as count
FROM payments 
WHERE enrollment_id IS NULL AND course_id IS NOT NULL;

-- 4. Check payments with neither (invalid)
SELECT 
  'Payments with neither enrollmentId nor courseId (invalid)' as metric,
  COUNT(*) as count
FROM payments 
WHERE enrollment_id IS NULL AND course_id IS NULL;

-- 5. Check for inconsistencies (enrollmentId points to different course than courseId)
SELECT 
  'Inconsistent payments (enrollment course != payment course)' as metric,
  COUNT(*) as count
FROM payments p
LEFT JOIN enrollments e ON p.enrollment_id = e.id
WHERE p.enrollment_id IS NOT NULL 
  AND p.course_id IS NOT NULL 
  AND p.course_id != e.course_id;

-- 6. Detailed view of orphaned payments
SELECT 
  p.id,
  p.student_id,
  p.course_id,
  c.title as course_title,
  p.amount,
  p.status,
  p.created
FROM payments p
LEFT JOIN courses c ON p.course_id = c.id
WHERE p.enrollment_id IS NULL AND p.course_id IS NOT NULL
ORDER BY p.created DESC;

-- 7. Detailed view of inconsistent payments
SELECT 
  p.id,
  p.enrollment_id,
  p.course_id as payment_course_id,
  e.course_id as enrollment_course_id,
  pc.title as payment_course_title,
  ec.title as enrollment_course_title,
  p.amount,
  p.status
FROM payments p
LEFT JOIN enrollments e ON p.enrollment_id = e.id
LEFT JOIN courses pc ON p.course_id = pc.id
LEFT JOIN courses ec ON e.course_id = ec.id
WHERE p.enrollment_id IS NOT NULL 
  AND p.course_id IS NOT NULL 
  AND p.course_id != e.course_id;
