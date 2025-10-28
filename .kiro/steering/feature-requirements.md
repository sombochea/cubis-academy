---
inclusion: always
---

# Feature Requirements & User Roles

## Role-Based Access Control

### Student (`role: 'student'`)
Routes: `/student/*`
- Register (email/password or Google OAuth2)
- Manage profile (full_name, email, phone_number, gender, date_of_birth, address, profile_photo)
- Browse and enroll in courses
- Submit payments (manual for MVP)
- View payment history
- Access enrolled course materials only (videos, Zoom links)
- View own scores and attendance

### Teacher (`role: 'teacher'`)
Routes: `/teacher/*`
- Login (email/password or Google OAuth2)
- View assigned courses and schedules
- Manage course materials (upload docs, add YouTube/Zoom links)
- Add/update student scores
- Mark attendance
- View class rosters

### Admin (`role: 'admin'`)
Routes: `/admin/*`
- Full system access
- Manage teachers (add/remove, assign courses)
- View all students and enrollments
- Oversee courses and payments
- Access all data for reporting

## MVP Features

### Authentication (Auth.js)
- Email/password + Google OAuth2
- Role-based route protection
- Session management
- Password reset flow

### Student Portal (`/student/*`)
- Registration form: full_name, email, phone_number, gender, date_of_birth, address, profile_photo
- Profile editing
- Course catalog with enrollment
- Manual payment submission
- Payment history table
- Course materials (restricted to enrolled courses)
- Scores and attendance view

### Teacher Dashboard (`/teacher/*`)
- Schedule calendar
- Course material management (docs, YouTube links, Zoom links)
- Student scoring interface
- Attendance marking
- Class roster

### Admin Backoffice (`/admin/*`)
- Teacher CRUD and course assignment
- Student and enrollment overview
- Course management
- Payment tracking

## Implementation Rules
- Protect all routes with middleware checking user role
- Validate all form inputs with Zod schemas
- Use useSWR for client-side data fetching
- Implement loading and error states for all async operations
- Show clear user feedback for all actions
- Ensure WCAG AA compliance on all pages

## Out of Scope (Post-MVP)
Payment gateways, assignments, forums, messaging, certificates, analytics
