# Enrollments Management Documentation

## Overview

Comprehensive enrollments management system for tracking student course enrollments, progress, scores, and attendance.

## Features

### 1. Enrollments List (DataTable)
**Location**: `app/[locale]/(admin)/admin/enrollments/page.tsx`

- **Search**: Search by student name
- **Filter**: Filter by enrollment status (Active, Completed, Dropped, Suspended)
- **Sort**: Sort by student name, course title, progress, enrolled date
- **Pagination**: 10, 20, 30, 40, 50 rows per page
- **Row Numbers**: Automatic row numbering with pagination support
- **Column Visibility**: Toggle column visibility

**Columns**:
- Student (Name + SUID)
- Course Title
- Status (with color badges)
- Progress (visual progress bar)
- Enrolled Date
- Completed Date
- Actions (View, Delete)

### 2. Enrollment Details Page
**Location**: `app/[locale]/(admin)/admin/enrollments/[id]/page.tsx`

**Information Displayed**:
- Student details (name, SUID, email) with link to student profile
- Course details (title, category, level) with link to course page
- Enrollment dates (enrolled, completed)
- Status badge
- Progress percentage with visual bar
- Average score calculation
- Attendance rate calculation

**Sections**:
1. **Enrollment Information**: Student and course details
2. **Scores History**: All scores with dates and max scores
3. **Attendance Records**: Recent attendance with status badges
4. **Sidebar Stats**:
   - Current status
   - Course progress (%)
   - Average score (/100)
   - Attendance rate (%)

### 3. Delete Enrollment
**Location**: `app/[locale]/(admin)/admin/enrollments/[id]/delete/page.tsx`

- Confirmation dialog with warning
- Cascading delete (removes scores and attendance records)
- Error handling
- Loading state

## Components

### EnrollmentsDataTable
**Location**: `components/admin/EnrollmentsDataTable.tsx`

Reusable DataTable component for displaying enrollments.

**Props**:
```typescript
{
  data: Enrollment[];
  locale: string;
}
```

**Features**:
- Sortable columns
- Status filtering
- Search by student name
- Row actions dropdown
- Progress bar visualization

### EnrollmentFilters
**Location**: `components/admin/EnrollmentFilters.tsx`

Filter component for enrollment status.

**Options**:
- All Status
- Active
- Completed
- Dropped
- Suspended

## API Routes

### DELETE /api/enrollments/[id]
**Location**: `app/api/enrollments/[id]/route.ts`

Deletes an enrollment and all associated data.

**Authorization**: Admin only

**Cascade Deletes**:
1. Scores (all scores for this enrollment)
2. Attendance records (all attendance for this enrollment)
3. Enrollment record

**Response**:
```json
{
  "success": true
}
```

## Database Schema

### Enrollments Table
```sql
enrollments:
- id: UUID (PK)
- student_id: UUID (FK -> students.user_id)
- course_id: UUID (FK -> courses.id)
- status: ENUM ('active', 'completed', 'dropped', 'suspended')
- progress: INTEGER (0-100)
- enrolled: TIMESTAMP
- completed: TIMESTAMP (nullable)
```

### Related Tables
- **scores**: Linked via enrollment_id
- **attendances**: Linked via enrollment_id

## Status Types

1. **Active**: Student is currently enrolled and taking the course
2. **Completed**: Student has finished the course
3. **Dropped**: Student has withdrawn from the course
4. **Suspended**: Enrollment is temporarily suspended

## Progress Calculation

Progress is stored as an integer (0-100) representing percentage completion.

**Visual Representation**:
- Progress bar with gradient (blue to dark blue)
- Percentage text display
- Color-coded based on completion level

## Attendance Rate Calculation

```typescript
const attendanceRate = (presentCount / totalClasses) * 100;
```

**Status Types**:
- Present (green badge)
- Absent (red badge)
- Late (yellow badge)
- Excused (blue badge)

## Average Score Calculation

```typescript
const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
```

Displayed as a number out of 100.

## Actions Available

### From Enrollments List:
1. **View Details**: Navigate to enrollment details page
2. **View Student**: Navigate to student profile
3. **View Course**: Navigate to course details
4. **Delete**: Remove enrollment (with confirmation)

### From Enrollment Details:
1. **Back to Enrollments**: Return to list
2. **View Student Profile**: Link to student page
3. **View Course Details**: Link to course page

## Permissions

**Admin Only**:
- View all enrollments
- View enrollment details
- Delete enrollments

**Future Enhancements**:
- Teachers: View enrollments for their courses
- Students: View their own enrollments

## UI/UX Features

1. **Color-Coded Status Badges**:
   - Active: Green
   - Completed: Blue
   - Dropped: Red
   - Suspended: Yellow

2. **Visual Progress Indicators**:
   - Progress bars with gradients
   - Percentage displays
   - Large stat cards

3. **Responsive Design**:
   - Mobile-friendly table
   - Stacked layout on small screens
   - Touch-friendly action buttons

4. **Loading States**:
   - Skeleton loaders
   - Button loading spinners
   - Smooth transitions

5. **Empty States**:
   - "No enrollments found" message
   - "No scores recorded yet" message
   - "No attendance records yet" message

## Internationalization

All text is wrapped with `<Trans>` for i18n support.

**Supported Languages**:
- Khmer (km)
- English (en)

## Best Practices

1. **Always show enrollment status** with color-coded badges
2. **Display progress visually** with bars and percentages
3. **Link to related entities** (student, course)
4. **Confirm destructive actions** (delete)
5. **Show comprehensive stats** (progress, scores, attendance)
6. **Handle empty states** gracefully
7. **Provide clear navigation** (back buttons, breadcrumbs)

## Future Enhancements

1. **Bulk Actions**: Select multiple enrollments for bulk operations
2. **Export**: Export enrollment data to CSV/Excel
3. **Status Change**: Change enrollment status directly from list
4. **Progress Update**: Manual progress adjustment
5. **Notifications**: Email notifications for status changes
6. **Analytics**: Enrollment trends and statistics
7. **Filters**: More filter options (date range, course, student)
8. **Sorting**: Additional sort options
