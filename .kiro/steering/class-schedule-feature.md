# Class Schedule Feature

## Overview

The class schedule system allows courses to have recurring weekly schedules that students can view when enrolled. This helps students plan their time and know when classes are held.

## Database Schema

### Table: `class_schedules`

```typescript
export const classSchedules = pgTable("class_schedules", {
  id: uuid("id").primaryKey(),
  courseId: uuid("course_id").notNull(), // Links to courses table
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(), // monday-sunday
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM format
  location: text("location"), // Physical location or online link
  notes: text("notes"), // Additional information
  isActive: boolean("is_active").default(true),
  created: timestamp("created").notNull(),
  updated: timestamp("updated").notNull(),
});
```

### Enums

```typescript
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);
```

### Indexes

- `class_schedules_course_id_idx` - Fast lookup by course
- `class_schedules_day_of_week_idx` - Filter by day
- `class_schedules_is_active_idx` - Filter active schedules

## Features

### 1. Multiple Schedules Per Course

- A course can have multiple class sessions per week
- Each session has a specific day and time
- Example: Monday 9:00-11:00, Wednesday 14:00-16:00

### 2. Time Format

- Uses 24-hour format (HH:MM)
- Examples: "09:00", "14:30", "18:00"
- Stored as strings for simplicity and flexibility

### 3. Location Information

- For **online courses**: Can store Zoom/Google Meet links
- For **face-to-face courses**: Physical classroom/building location
- For **hybrid courses**: Can specify which sessions are online vs in-person

### 4. Schedule Display

- Sorted by day of week (Monday to Sunday)
- Shows day name, time range, and location
- Icons indicate delivery mode (Monitor for online, MapPin for physical)
- Optional notes for additional information

### 5. Active/Inactive Schedules

- Schedules can be marked as inactive without deletion
- Only active schedules are shown to students
- Useful for temporary schedule changes or semester breaks

## Component: ClassSchedule

### Props

```typescript
interface ClassScheduleProps {
  schedules: Schedule[];
  deliveryMode: 'online' | 'face_to_face' | 'hybrid';
}
```

### Features

- Automatically sorts schedules by day of week
- Shows appropriate icons based on delivery mode
- Displays time in readable format
- Shows location with proper icon
- Handles empty state gracefully

### UI Design

- Compact card layout with gradient icon
- Day name prominently displayed
- Time range with clock icon
- Location with appropriate icon (Monitor/MapPin)
- Optional notes in lighter text
- Hover effect for better interactivity

## Integration

### Enrollment Details Page

The class schedule is displayed in a 3-column grid alongside:
1. **Class Schedule** (left column)
2. **Scores** (middle column)
3. **Attendance** (right column)

This layout provides a comprehensive view of the student's course information.

### Data Flow

1. Course admin/teacher creates schedules for a course
2. Schedules are stored in `class_schedules` table
3. When student views enrollment details, schedules are fetched
4. Only active schedules for the enrolled course are shown
5. Schedules are sorted and displayed with proper formatting

## Example Data

```typescript
// Monday morning class
{
  courseId: "course-uuid",
  dayOfWeek: "monday",
  startTime: "09:00",
  endTime: "11:00",
  location: "Room 301, Building A",
  notes: "Bring your laptop",
  isActive: true
}

// Wednesday online class
{
  courseId: "course-uuid",
  dayOfWeek: "wednesday",
  startTime: "14:00",
  endTime: "16:00",
  location: "https://zoom.us/j/123456789",
  notes: "Check email for meeting password",
  isActive: true
}
```

## Use Cases

### For Students

1. **View Weekly Schedule**: See all class times at a glance
2. **Plan Attendance**: Know when to attend classes
3. **Access Online Links**: Click location for online classes
4. **Check Location**: Find physical classroom locations
5. **Read Notes**: Get additional class information

### For Teachers/Admins

1. **Set Regular Schedule**: Define recurring weekly classes
2. **Update Times**: Modify class times as needed
3. **Add Locations**: Specify where classes are held
4. **Provide Notes**: Add important information
5. **Manage Changes**: Activate/deactivate schedules

## Future Enhancements

### Short-term
- Schedule conflict detection for students
- Calendar export (iCal format)
- Email reminders before class
- Mobile notifications

### Long-term
- One-time schedule exceptions (holidays, makeup classes)
- Recurring patterns (every other week, monthly)
- Room booking integration
- Automatic attendance marking via QR codes
- Integration with Google Calendar/Outlook

## Admin Interface ✅ IMPLEMENTED

Location: `/admin/courses/[id]/schedules`

### Features

1. **Schedule List View**
   - Grid layout showing all schedules
   - Sorted by day of week
   - Visual indicators for active/inactive schedules
   - Quick edit and delete actions

2. **Add/Edit Schedule Dialog**
   - Day of week selector
   - Time pickers (start/end time)
   - Location input (adapts to delivery mode)
   - Notes textarea
   - Active/inactive toggle
   - Real-time validation

3. **Delete Confirmation**
   - Alert dialog before deletion
   - Prevents accidental deletions

4. **Empty State**
   - Helpful message when no schedules exist
   - Call-to-action to add first schedule

5. **Access Control**
   - Only admins and teachers can manage schedules
   - Proper authentication and authorization

### Component: ScheduleManager

**Props:**
```typescript
{
  courseId: string;
  initialSchedules: Schedule[];
  deliveryMode: 'online' | 'face_to_face' | 'hybrid';
  defaultLocation: string | null;
  locale: string;
}
```

**Features:**
- Client-side state management
- Optimistic UI updates
- Error handling with user feedback
- Loading states during API calls
- Form validation
- Responsive design

## API Endpoints ✅ IMPLEMENTED

### Create Schedule
```typescript
POST /api/courses/[courseId]/schedules
Headers: { Authorization: Bearer token }
Body: {
  dayOfWeek: 'monday' | 'tuesday' | ... | 'sunday',
  startTime: string, // HH:MM format
  endTime: string,   // HH:MM format
  location?: string,
  notes?: string,
  isActive?: boolean
}
Response: Schedule object (201 Created)
```

### Get Course Schedules
```typescript
GET /api/courses/[courseId]/schedules
Headers: { Authorization: Bearer token }
Response: Schedule[] (200 OK)
```

### Update Schedule
```typescript
PUT /api/schedules/[id]
Headers: { Authorization: Bearer token }
Body: {
  dayOfWeek?: 'monday' | ... | 'sunday',
  startTime?: string,
  endTime?: string,
  location?: string,
  notes?: string,
  isActive?: boolean
}
Response: Updated Schedule object (200 OK)
```

### Delete Schedule
```typescript
DELETE /api/schedules/[id]
Headers: { Authorization: Bearer token }
Response: { success: true } (200 OK)
```

### Validation Rules

1. **Time Format**: Must be HH:MM (24-hour format)
2. **Time Range**: End time must be after start time
3. **Day of Week**: Must be valid enum value
4. **Authorization**: Only admin and teacher roles allowed
5. **Course Existence**: Course must exist for creation

## Database Migration

Migration file: `0006_sturdy_mystique.sql`

Changes:
- Added `day_of_week` enum
- Created `class_schedules` table
- Added indexes for performance
- Added relations to courses table

Status: ✅ Applied to database

## Benefits

1. **Better Planning**: Students know exactly when classes are held
2. **Reduced Confusion**: Clear schedule reduces missed classes
3. **Flexibility**: Supports various delivery modes and locations
4. **Scalability**: Can handle complex schedules with multiple sessions
5. **User Experience**: Clean, intuitive display of schedule information

## Notes

- Time is stored as strings for simplicity (HH:MM format)
- No timezone handling in MVP (assumes all users in same timezone)
- Schedules are recurring weekly (no one-time exceptions in MVP)
- Location field is flexible (can be physical address or URL)
- Empty state handled gracefully when no schedules exist
