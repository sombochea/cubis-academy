---
inclusion: fileMatch
fileMatchPattern: ["**/drizzle/**/*", "**/lib/db/**/*", "**/*.sql"]
---

# Database Schema

All fields use `snake_case` naming.

**IMPORTANT:** All UUID fields MUST use UUID v7 for better performance and natural time-based ordering.

### users

Core user authentication and profile table.

| Field     | Type    | Description                          | Index |
| --------- | ------- | ------------------------------------ | ----- |
| id        | UUID v7 | Primary key                          | PK    |
| name      | String  | User's full name                     | -     |
| email     | String  | Unique email address                 | UQ    |
| phone     | String  | Contact number                       | -     |
| role      | Enum    | 'student', 'teacher', 'admin'        | IDX   |
| pass_hash | String  | Hashed password (nullable for OAuth) | -     |
| google_id | String  | Google OAuth ID (nullable)           | UQ    |
| is_active | Boolean | Account active status (default true) | IDX   |
| created   | Timestamp | Account creation time              | IDX   |
| updated   | Timestamp | Last update time                   | -     |

### students

Extended profile for student users.

| Field    | Type      | Description                               | Index |
| -------- | --------- | ----------------------------------------- | ----- |
| user_id  | UUID v7   | Foreign key to users.id (PK)              | PK/FK |
| suid     | String    | Student Unique ID (e.g., STU-2025-001234) | UQ    |
| dob      | Date      | Date of birth                             | -     |
| gender   | String    | Gender information                        | IDX   |
| address  | Text      | Physical address                          | -     |
| photo    | String    | URL to profile image                      | -     |
| enrolled | Timestamp | First enrollment date                     | IDX   |

**Note:** `suid` is unique, indexed, and auto-generated on student creation (format: `STU-{YEAR}-{6-digit-sequence}`)

### teachers

Extended profile for teacher users.

| Field    | Type      | Description                  | Index |
| -------- | --------- | ---------------------------- | ----- |
| user_id  | UUID v7   | Foreign key to users.id (PK) | PK/FK |
| bio      | Text      | Teacher biography            | -     |
| spec     | String    | Teaching specialization      | IDX   |
| schedule | JSON/Text | Teaching schedule details    | -     |
| photo    | String    | URL to profile image         | -     |

### courses

Course catalog and information.

| Field       | Type      | Description                            | Index |
| ----------- | --------- | -------------------------------------- | ----- |
| id          | UUID v7   | Primary key                            | PK    |
| title       | String    | Course title                           | IDX   |
| desc        | Text      | Course description                     | -     |
| category    | String    | Course category (Web Dev, UX/UI, etc.) | IDX   |
| teacher_id  | UUID v7   | Foreign key to teachers.user_id        | FK/IDX |
| price       | Decimal   | Course price                           | -     |
| duration    | Integer   | Duration in hours                      | -     |
| level       | Enum      | 'beginner', 'intermediate', 'advanced' | IDX   |
| is_active   | Boolean   | Course availability (default true)     | IDX   |
| youtube_url | String    | Course video link (nullable)           | -     |
| zoom_url    | String    | Online meeting link (nullable)         | -     |
| created     | Timestamp | Course creation time                   | IDX   |
| updated     | Timestamp | Last update time                       | -     |

### enrollments

Student course enrollments.

| Field      | Type      | Description                      | Index      |
| ---------- | --------- | -------------------------------- | ---------- |
| id         | UUID v7   | Primary key                      | PK         |
| student_id | UUID v7   | Foreign key to students.user_id  | FK/IDX     |
| course_id  | UUID v7   | Foreign key to courses.id        | FK/IDX     |
| status     | Enum      | 'active', 'completed', 'dropped' | IDX        |
| progress   | Integer   | Completion percentage (0-100)    | -          |
| enrolled   | Timestamp | Enrollment time                  | IDX        |
| completed  | Timestamp | Completion time (nullable)       | IDX        |

**Composite Index:** `(student_id, course_id)` - Unique constraint and fast lookup

### payments

Payment transactions.

| Field      | Type      | Description                      | Index  |
| ---------- | --------- | -------------------------------- | ------ |
| id         | UUID v7   | Primary key                      | PK     |
| student_id | UUID v7   | Foreign key to students.user_id  | FK/IDX |
| course_id  | UUID v7   | Foreign key to courses.id        | FK/IDX |
| amount     | Decimal   | Payment amount                   | -      |
| method     | String    | Payment method used              | IDX    |
| status     | Enum      | 'pending', 'completed', 'failed' | IDX    |
| txn_id     | String    | External transaction reference   | UQ     |
| notes      | Text      | Additional notes (nullable)      | -      |
| created    | Timestamp | Payment time                     | IDX    |

**Composite Index:** `(student_id, created)` - Fast student payment history lookup

### scores

Student course scores.

| Field         | Type      | Description                   | Index  |
| ------------- | --------- | ----------------------------- | ------ |
| id            | UUID v7   | Primary key                   | PK     |
| enrollment_id | UUID v7   | Foreign key to enrollments.id | FK/IDX |
| title         | String    | Assessment title              | -      |
| score         | Decimal   | Numeric score (0-100)         | -      |
| max_score     | Decimal   | Maximum possible score        | -      |
| remarks       | Text      | Teacher comments (nullable)   | -      |
| created       | Timestamp | Score entry time              | IDX    |

**Composite Index:** `(enrollment_id, created)` - Fast score history lookup

### attendances

Class attendance records.

| Field         | Type      | Description                   | Index      |
| ------------- | --------- | ----------------------------- | ---------- |
| id            | UUID v7   | Primary key                   | PK         |
| enrollment_id | UUID v7   | Foreign key to enrollments.id | FK/IDX     |
| date          | Date      | Attendance date               | IDX        |
| status        | Enum      | 'present', 'absent', 'late'   | IDX        |
| notes         | Text      | Additional notes (nullable)   | -          |
| created       | Timestamp | Record creation time          | -          |

**Composite Index:** `(enrollment_id, date)` - Unique constraint and fast date-based lookup

## Key Relationships

- `users` → `students` (1:1, via `user_id`)
- `users` → `teachers` (1:1, via `user_id`)
- `teachers` → `courses` (1:many, via `teacher_id`)
- `students` + `courses` → `enrollments` (many:many junction)
- `enrollments` → `scores` (1:many)
- `enrollments` → `attendances` (1:many)
- `students` → `payments` (1:many)

## Important Notes

- **UUID v7:** Use UUID v7 for all UUID fields (better performance, time-ordered)
- **Drizzle ORM:** Use for all database operations
- **Parameterized Queries:** Always use (Drizzle handles this automatically)
- **Index Strategy:** Index all foreign keys and frequently queried fields
- **SUID Generation:** Auto-generate on student creation using format `STU-{YEAR}-{6-digit-sequence}` (e.g., STU-2025-000001)
- **Enum Values:**
  - `role`: 'student', 'teacher', 'admin'
  - `enrollment.status`: 'active', 'completed', 'dropped'
  - `payment.status`: 'pending', 'completed', 'failed'
  - `attendance.status`: 'present', 'absent', 'late'
  - `course.level`: 'beginner', 'intermediate', 'advanced'

## UUID v7 Benefits

1. **Time-ordered:** Natural chronological sorting
2. **Better Performance:** Improved B-tree index performance vs UUID v4
3. **Reduced Fragmentation:** Sequential IDs reduce database fragmentation
4. **Debugging:** Easier to identify when records were created

## Query Optimization Tips

1. Always use indexed columns in WHERE clauses
2. Use composite indexes for multi-column queries
3. Avoid SELECT * - specify needed columns
4. Use LIMIT for pagination
5. Consider covering indexes for frequently accessed columns
6. Monitor slow queries and add indexes as needed

## Index Legend

- **PK** - Primary Key (automatically indexed)
- **FK** - Foreign Key (should be indexed)
- **UQ** - Unique Index
- **IDX** - Regular Index for query optimization

## Critical Indexes for Performance

### Unique Indexes
- `users.email` - Login and user lookup
- `users.google_id` - OAuth authentication
- `students.suid` - Student ID lookup
- `payments.txn_id` - Transaction tracking
- `enrollments(student_id, course_id)` - Prevent duplicate enrollments
- `attendances(enrollment_id, date)` - Prevent duplicate attendance records

### Regular Indexes
- `users.role` - Role-based queries
- `users.is_active` - Active user filtering
- `users.created` - User registration reports
- `students.gender` - Demographics filtering
- `students.enrolled` - Enrollment date queries
- `teachers.spec` - Specialization filtering
- `courses.title` - Course search
- `courses.category` - Category filtering
- `courses.level` - Level filtering
- `courses.is_active` - Active course filtering
- `courses.teacher_id` - Teacher's courses lookup
- `courses.created` - Course creation reports
- `enrollments.student_id` - Student's enrollments
- `enrollments.course_id` - Course enrollments
- `enrollments.status` - Status filtering
- `enrollments.enrolled` - Enrollment date queries
- `enrollments.completed` - Completion tracking
- `payments.student_id` - Student payment history
- `payments.method` - Payment method reports
- `payments.status` - Payment status filtering
- `payments.created` - Payment date queries
- `scores.enrollment_id` - Student scores lookup
- `scores.created` - Score entry tracking
- `attendances.enrollment_id` - Attendance records
- `attendances.date` - Date-based attendance
- `attendances.status` - Attendance status filtering

### Composite Indexes
- `(student_id, course_id)` on enrollments - Fast enrollment lookup
- `(enrollment_id, date)` on attendances - Fast attendance lookup
- `(student_id, created)` on payments - Student payment history
- `(enrollment_id, created)` on scores - Score history
