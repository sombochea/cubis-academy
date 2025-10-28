---
inclusion: fileMatch
fileMatchPattern: ["**/drizzle/**/*", "**/lib/db/**/*", "**/*.sql"]
---

# Database Schema

All fields use `snake_case` naming.

### users

Core user authentication and profile table.

| Field     | Type        | Description                          |
| --------- | ----------- | ------------------------------------ |
| id        | UUID/Serial | Primary key                          |
| name      | String      | User's full name                     |
| email     | String      | Unique email address                 |
| phone     | String      | Contact number                       |
| role      | Enum        | 'student', 'teacher', 'admin'        |
| pass_hash | String      | Hashed password (nullable for OAuth) |
| google_id | String      | Google OAuth ID (nullable)           |
| is_active | Boolean     | Account active status (default true) |
| created   | Timestamp   | Account creation time                |
| updated   | Timestamp   | Last update time                     |

### students

Extended profile for student users.

| Field    | Type         | Description                               |
| -------- | ------------ | ----------------------------------------- |
| user_id  | UUID/Integer | Foreign key to users.id (PK)              |
| suid     | String       | Student Unique ID (e.g., STU-2025-001234) |
| dob      | Date         | Date of birth                             |
| gender   | String       | Gender information                        |
| address  | Text         | Physical address                          |
| photo    | String       | URL to profile image                      |
| enrolled | Timestamp    | First enrollment date                     |

**Note:** `suid` is unique, indexed, and auto-generated on student creation (format: `STU-{YEAR}-{6-digit-sequence}`)

### teachers

Extended profile for teacher users.

| Field    | Type         | Description                  |
| -------- | ------------ | ---------------------------- |
| user_id  | UUID/Integer | Foreign key to users.id (PK) |
| bio      | Text         | Teacher biography            |
| spec     | String       | Teaching specialization      |
| schedule | JSON/Text    | Teaching schedule details    |

### courses

Course catalog and information.

| Field       | Type         | Description                            |
| ----------- | ------------ | -------------------------------------- |
| id          | UUID/Serial  | Primary key                            |
| title       | String       | Course title                           |
| desc        | Text         | Course description                     |
| category    | String       | Course category (Web Dev, UX/UI, etc.) |
| teacher_id  | UUID/Integer | Foreign key to teachers.user_id        |
| price       | Decimal      | Course price                           |
| duration    | Integer      | Duration in hours                      |
| level       | Enum         | 'beginner', 'intermediate', 'advanced' |
| is_active   | Boolean      | Course availability (default true)     |
| youtube_url | String       | Course video link (nullable)           |
| zoom_url    | String       | Online meeting link (nullable)         |
| created     | Timestamp    | Course creation time                   |
| updated     | Timestamp    | Last update time                       |

### enrollments

Student course enrollments.

| Field      | Type         | Description                      |
| ---------- | ------------ | -------------------------------- |
| id         | UUID/Serial  | Primary key                      |
| student_id | UUID/Integer | Foreign key to students.user_id  |
| course_id  | UUID/Integer | Foreign key to courses.id        |
| status     | Enum         | 'active', 'completed', 'dropped' |
| progress   | Integer      | Completion percentage (0-100)    |
| enrolled   | Timestamp    | Enrollment time                  |
| completed  | Timestamp    | Completion time (nullable)       |

### payments

Payment transactions.

| Field      | Type         | Description                      |
| ---------- | ------------ | -------------------------------- |
| id         | UUID/Serial  | Primary key                      |
| student_id | UUID/Integer | Foreign key to students.user_id  |
| course_id  | UUID/Integer | Foreign key to courses.id        |
| amount     | Decimal      | Payment amount                   |
| method     | String       | Payment method used              |
| status     | Enum         | 'pending', 'completed', 'failed' |
| txn_id     | String       | External transaction reference   |
| notes      | Text         | Additional notes (nullable)      |
| created    | Timestamp    | Payment time                     |

### scores

Student course scores.

| Field         | Type         | Description                   |
| ------------- | ------------ | ----------------------------- |
| id            | UUID/Serial  | Primary key                   |
| enrollment_id | UUID/Integer | Foreign key to enrollments.id |
| title         | String       | Assessment title              |
| score         | Decimal      | Numeric score (0-100)         |
| max_score     | Decimal      | Maximum possible score        |
| remarks       | Text         | Teacher comments (nullable)   |
| created       | Timestamp    | Score entry time              |

### attendances

Class attendance records.

| Field         | Type         | Description                   |
| ------------- | ------------ | ----------------------------- |
| id            | UUID/Serial  | Primary key                   |
| enrollment_id | UUID/Integer | Foreign key to enrollments.id |
| date          | Date         | Attendance date               |
| status        | Enum         | 'present', 'absent', 'late'   |
| notes         | Text         | Additional notes (nullable)   |
| created       | Timestamp    | Record creation time          |

## Key Relationships

- `users` → `students` (1:1, via `user_id`)
- `users` → `teachers` (1:1, via `user_id`)
- `teachers` → `courses` (1:many, via `teacher_id`)
- `students` + `courses` → `enrollments` (many:many junction)
- `enrollments` → `scores` (1:many)
- `enrollments` → `attendances` (1:many)
- `students` → `payments` (1:many)

## Important Notes

- Use Drizzle ORM for all database operations
- Always use parameterized queries (Drizzle handles this)
- Index foreign keys and frequently queried fields
- **SUID Generation:** Auto-generate on student creation using format `STU-{YEAR}-{6-digit-sequence}` (e.g., STU-2025-000001)
- Enum values:
  - `role`: 'student', 'teacher', 'admin'
  - `enrollment.status`: 'active', 'completed', 'dropped'
  - `payment.status`: 'pending', 'completed', 'failed'
  - `attendance.status`: 'present', 'absent', 'late'
  - `course.level`: 'beginner', 'intermediate', 'advanced'

## Indexes to Create

- `students.suid` (unique)
- `users.email` (unique)
- `users.google_id` (unique, nullable)
- `enrollments(student_id, course_id)` (composite unique)
- `payments.student_id`
- `payments.txn_id` (unique)
- `scores.enrollment_id`
- `attendances(enrollment_id, date)` (composite unique)
