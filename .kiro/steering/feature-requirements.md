---
inclusion: always
---

# Feature Requirements & User Roles

## Role-Based Access Control (RBAC)

This system has three roles with distinct permissions and route access.

### Student (`role: 'student'`)

Routes: `/{locale}/student/*` (e.g., `/km/student/*`, `/en/student/*`)

Capabilities:
- Register with email/password or Google OAuth2
- Manage profile: `full_name`, `email`, `phone_number`, `gender`, `date_of_birth`, `address`, `profile_photo`
- Browse course catalog and enroll in courses
- Submit manual payment records (MVP - no payment gateway)
- View payment history
- Access course materials ONLY for enrolled courses (videos, Zoom links, documents)
- View own scores and attendance records

Restrictions:
- Cannot access teacher or admin routes
- Cannot view other students' data
- Cannot modify course content or scores

### Teacher (`role: 'teacher'`)

Routes: `/{locale}/teacher/*` (e.g., `/km/teacher/*`, `/en/teacher/*`)

Capabilities:
- Login with email/password or Google OAuth2
- View assigned courses and schedules
- Manage course materials (upload documents, add YouTube/Zoom links)
- Add/update student scores for assigned courses
- Mark attendance for assigned courses
- View class rosters for assigned courses

Restrictions:
- Cannot access admin routes
- Cannot manage other teachers
- Cannot view courses not assigned to them

### Admin (`role: 'admin'`)

Routes: `/{locale}/admin/*` (e.g., `/km/admin/*`, `/en/admin/*`)

Capabilities:
- Full system access (all routes)
- Manage teachers (create, update, delete, assign courses)
- View all students and enrollments
- Manage courses (create, update, delete)
- Track all payments
- Access all data for reporting

## MVP Feature Scope

### Authentication (Auth.js v5)
- Email/password authentication
- Google OAuth2 integration
- Role-based route protection via proxy.ts (Next.js 16)
- Session management
- Password reset flow
- Locale-aware redirects

### Internationalization (i18n)
- Support Khmer (km) and English (en)
- All user-facing text must be translatable
- Use `<Trans>` component from Lingui
- Language switcher in navigation
- Locale persists across navigation
- Fonts: Kantumruy Pro (Khmer), Manrope (English)

### Student Portal (`/{locale}/student/*`)
- Registration form with fields: `full_name`, `email`, `phone_number`, `gender`, `date_of_birth`, `address`, `profile_photo`
- Profile editing page
- Course catalog with search/filter
- Enrollment button (creates enrollment record)
- Manual payment submission form
- Payment history table
- Course materials page (restricted to enrolled courses)
- Scores and attendance view

### Teacher Dashboard (`/{locale}/teacher/*`)
- Schedule calendar showing assigned courses
- Course material management (upload docs, add YouTube/Zoom links)
- Student scoring interface (add/update scores)
- Attendance marking interface
- Class roster view

### Admin Backoffice (`/{locale}/admin/*`)
- Teacher CRUD operations
- Course assignment to teachers
- Student and enrollment overview tables
- Course management (CRUD)
- Payment tracking dashboard

## Implementation Requirements

When building features:
- Protect ALL routes with proxy.ts checking session + role
- ALL routes must be locale-aware: `/{locale}/path`
- Wrap ALL user-facing text with `<Trans>` component
- Validate ALL form inputs with Zod schemas (client + server)
- Use useSWR for client-side data fetching with proper caching
- Implement loading states (spinners, skeletons) for async operations
- Implement error states with user-friendly messages
- Show success feedback after actions (toasts, messages)
- Ensure WCAG AA accessibility compliance
- Ensure responsive design (mobile, tablet, desktop)
- Use database field names in `snake_case` (e.g., `full_name`, `created_at`)
- Test on multiple devices and browsers

## Out of Scope (Post-MVP)

Do NOT implement these features:
- Payment gateway integration (Stripe, PayPal, etc.)
- Assignment submission system
- Discussion forums
- Direct messaging between users
- Certificate generation
- Analytics dashboards
- Email notifications (beyond password reset)
