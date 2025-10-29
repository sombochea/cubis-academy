# Seed Data Reference

This document contains all the sample data created by the seed script.

## Login Credentials

**All passwords are: `123456`**

### Admin
- **Email**: admin@cubisacademy.com
- **Password**: 123456
- **Access**: Full system access

### Teachers

| Name | Email | Password | Specialization |
|------|-------|----------|----------------|
| John Smith | john@cubisacademy.com | 123456 | Web Development |
| Sarah Johnson | sarah@cubisacademy.com | 123456 | UX/UI Design |
| Michael Chen | michael@cubisacademy.com | 123456 | DevOps |
| Emily Davis | emily@cubisacademy.com | 123456 | Programming |

### Students

| Name | Email | Password | SUID |
|------|-------|----------|------|
| Alice Williams | alice@example.com | 123456 | STU-2025-000001 |
| Bob Martinez | bob@example.com | 123456 | STU-2025-000002 |
| Carol Brown | carol@example.com | 123456 | STU-2025-000003 |
| David Lee | david@example.com | 123456 | STU-2025-000004 |
| Eva Garcia | eva@example.com | 123456 | STU-2025-000005 |
| Frank Wilson | frank@example.com | 123456 | STU-2025-000006 |

## Courses

### 1. Full-Stack Web Development Bootcamp
- **Teacher**: John Smith
- **Category**: Web Development
- **Level**: Intermediate
- **Price**: $499.99
- **Duration**: 120 hours
- **Enrolled Students**: Alice, Bob

### 2. UX/UI Design Fundamentals
- **Teacher**: Sarah Johnson
- **Category**: UX/UI Design
- **Level**: Beginner
- **Price**: $399.99
- **Duration**: 80 hours
- **Enrolled Students**: Alice (completed), Carol

### 3. DevOps Engineering Masterclass
- **Teacher**: Michael Chen
- **Category**: DevOps
- **Level**: Advanced
- **Price**: $599.99
- **Duration**: 100 hours
- **Enrolled Students**: David

### 4. Python Programming for Beginners
- **Teacher**: Emily Davis
- **Category**: Programming
- **Level**: Beginner
- **Price**: $299.99
- **Duration**: 60 hours
- **Enrolled Students**: Bob, Eva (completed)

### 5. Advanced JavaScript & TypeScript
- **Teacher**: Emily Davis
- **Category**: Programming
- **Level**: Advanced
- **Price**: $449.99
- **Duration**: 90 hours
- **Enrolled Students**: Frank

### 6. Mobile-First Responsive Design
- **Teacher**: Sarah Johnson
- **Category**: UX/UI Design
- **Level**: Intermediate
- **Price**: $349.99
- **Duration**: 70 hours
- **Enrolled Students**: Carol

## Sample Data Includes

- ✅ 9 Enrollments with varying progress (15% - 100%)
- ✅ 9 Completed payments with transaction IDs
- ✅ 5 Score entries with grades and remarks
- ✅ Multiple attendance records (present, absent, late)
- ✅ Realistic student profiles with addresses and dates of birth
- ✅ Course materials (YouTube and Zoom links)

## Testing Scenarios

### As a Student (alice@example.com / 123456)
- View enrolled courses (2 courses)
- Check payment history
- View scores and attendance
- Browse available courses

### As a Teacher (john@cubisacademy.com / 123456)
- View assigned courses
- See enrolled students
- Manage course materials

### As an Admin (admin@cubisacademy.com / 123456)
- Access all system features
- View all users and courses
- Manage teachers and students

## Running the Seed

```bash
# First time: push the schema to your database
pnpm db:push

# Then run the seed script
pnpm db:seed
```

## Resetting Data

To reset and re-seed:

```bash
# Option 1: Clear and re-seed (recommended)
pnpm db:reset

# Option 2: Clear only
pnpm db:clear

# Option 3: Drop and recreate database
dropdb cubis_academy
createdb cubis_academy
pnpm db:push
pnpm db:seed
```

## Notes

- **All passwords are: `123456`** for easy testing
- All payments are marked as "completed" for testing
- Transaction IDs follow format: TXN-2025-NNNNNN
- Student IDs (SUID) follow format: STU-YYYY-NNNNNN
- Attendance records cover the last 5 days
- Some students have completed courses (100% progress)
- Scores range from 78% to 95%
