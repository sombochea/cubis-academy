# Phase 4 Week 2 - Real-time Features Implementation

## Overview

Implementing WebSocket-based real-time features using Pusher for live dashboard updates, instant notifications, and presence indicators.

## 🎯 Goals

**Real-time Capabilities**:
- Live dashboard updates without page refresh
- Instant notifications for important events
- Real-time enrollment tracking
- Live payment status updates
- Presence indicators (who's online)

**User Experience**:
- No manual refresh needed
- Instant feedback on actions
- Modern, interactive feel
- Better engagement

## 🏗️ Architecture

### Real-time Flow

```
User Action (e.g., New Enrollment)
    ↓
API Endpoint (e.g., POST /api/enrollments)
    ↓
Database Update
    ↓
Pusher Event Trigger (Server-side)
    ↓
WebSocket → Pusher Cloud
    ↓
WebSocket → Connected Clients
    ↓
React Hook Receives Event
    ↓
UI Updates Automatically
```

### Channel Structure

```
Private Channels (Authenticated):
- private-user-{userId}           // User-specific events
- private-student-dashboard-{id}  // Student dashboard
- private-teacher-dashboard-{id}  // Teacher dashboard
- private-admin-dashboard         // Admin dashboard
- private-course-{courseId}       // Course-specific events
- private-course-enrollments-{id} // Course enrollments

Presence Channels (Who's online):
- presence-course-{courseId}      // Who's viewing course

Public Channels:
- public-announcements            // Platform-wide announcements
```

## 📦 Implementation

### 1. Pusher Client (`lib/realtime/pusher.ts`)

**Server-side** (for triggering events):
```typescript
import { pusherServer, RealtimeService } from '@/lib/realtime/pusher';

// Trigger dashboard update
await RealtimeService.triggerDashboardUpdate(userId, data);

// Notify new enrollment
await RealtimeService.notifyNewEnrollment(courseId, teacherId, enrollment);

// Send notification
await RealtimeService.sendNotification(userId, {
  title: 'Payment Approved',
  message: 'Your payment has been approved!',
  type: 'success',
  link: '/student/payments',
});
```

**Client-side** (for receiving events):
```typescript
import { createPusherClient } from '@/lib/realtime/pusher';

const pusher = createPusherClient();
const channel = pusher.subscribe('private-user-123');
channel.bind('dashboard-update', (data) => {
  // Update UI
});
```

### 2. React Hooks (`lib/realtime/hooks.ts`)

**useDashboardUpdates** - Live dashboard updates:
```typescript
useDashboardUpdates(userId, (data) => {
  // Refresh dashboard data
  mutate('/api/dashboard');
});
```

**useNotifications** - Real-time notifications:
```typescript
const { notifications, dismissNotification } = useNotifications(userId);
```

**useNewEnrollments** - Track new enrollments:
```typescript
useNewEnrollments(courseId, (enrollment) => {
  // Update enrollment list
  setEnrollments(prev => [enrollment, ...prev]);
});
```

**usePaymentEvents** - Payment updates:
```typescript
usePaymentEvents(
  userId,
  (payment) => console.log('Payment received:', payment),
  (payment) => console.log('Payment approved:', payment)
);
```

**usePresence** - Who's online:
```typescript
const members = usePresence(`presence-course-${courseId}`);
// members = [{ id: 'user-1', ... }, { id: 'user-2', ... }]
```

### 3. Notification Component (`components/realtime/NotificationToast.tsx`)

**Usage**:
```typescript
import { NotificationToast } from '@/components/realtime/NotificationToast';

export default function Layout({ children }) {
  const session = await auth();
  
  return (
    <>
      {children}
      {session?.user && <NotificationToast userId={session.user.id} />}
    </>
  );
}
```

**Features**:
- Auto-dismiss after 5 seconds
- Manual dismiss with X button
- Color-coded by type (success, error, warning, info)
- Smooth animations
- Stacked notifications
- Click to view details

### 4. Pusher Authentication (`app/api/pusher/auth/route.ts`)

**Automatic authentication** for private channels:
```typescript
// Pusher client automatically calls this endpoint
// when subscribing to private/presence channels

POST /api/pusher/auth
Body: { socket_id, channel_name }
Response: { auth: "signature", channel_data: {...} }
```

**Security**:
- Verifies user session
- Checks channel access permissions
- Role-based authorization
- Prevents cross-user access

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
pnpm add pusher pusher-js
```

### 2. Create Pusher Account

1. Go to https://dashboard.pusher.com
2. Sign up (free tier available)
3. Create new Channels app
4. Choose region closest to your users
5. Copy credentials

### 3. Configure Environment Variables

Add to `.env.local`:

```env
# Pusher (Phase 4 Week 2)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
```

### 4. Add Notification Toast to Layout

```typescript
// app/[locale]/(student)/layout.tsx
import { NotificationToast } from '@/components/realtime/NotificationToast';
import { auth } from '@/auth';

export default async function StudentLayout({ children }) {
  const session = await auth();
  
  return (
    <>
      {children}
      {session?.user && <NotificationToast userId={session.user.id} />}
    </>
  );
}
```

### 5. Trigger Events from API Endpoints

**Example: New Enrollment**:
```typescript
// app/api/enrollments/route.ts
import { RealtimeService } from '@/lib/realtime/pusher';

export async function POST(req: Request) {
  // Create enrollment
  const enrollment = await db.insert(enrollments).values({...});
  
  // Trigger real-time event
  await RealtimeService.notifyNewEnrollment(
    enrollment.courseId,
    course.teacherId,
    {
      id: enrollment.id,
      studentName: student.name,
      courseName: course.title,
      timestamp: new Date().toISOString(),
    }
  );
  
  return Response.json({ success: true });
}
```

**Example: Payment Approval**:
```typescript
// app/api/payments/[id]/approve/route.ts
import { RealtimeService } from '@/lib/realtime/pusher';

export async function POST(req: Request, { params }) {
  // Approve payment
  await db.update(payments).set({ status: 'completed' });
  
  // Notify student
  await RealtimeService.sendNotification(payment.studentId, {
    title: 'Payment Approved! 🎉',
    message: `Your payment of $${payment.amount} has been approved.`,
    type: 'success',
    link: '/student/payments',
  });
  
  return Response.json({ success: true });
}
```

## 📊 Use Cases

### 1. Live Dashboard Updates

**Student Dashboard**:
```typescript
'use client';

import { useDashboardUpdates } from '@/lib/realtime/hooks';
import { mutate } from 'swr';

export function StudentDashboard({ userId }) {
  // Auto-refresh dashboard when data changes
  useDashboardUpdates(userId, () => {
    mutate('/api/student/dashboard');
  });
  
  return <DashboardContent />;
}
```

**Teacher Dashboard**:
```typescript
'use client';

import { useNewEnrollments } from '@/lib/realtime/hooks';

export function TeacherDashboard({ teacherId, courses }) {
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  
  // Track new enrollments across all courses
  courses.forEach(course => {
    useNewEnrollments(course.id, (enrollment) => {
      setEnrollmentCount(prev => prev + 1);
      // Show notification
      toast.success(`New enrollment: ${enrollment.studentName}`);
    });
  });
  
  return <DashboardContent enrollmentCount={enrollmentCount} />;
}
```

### 2. Real-time Notifications

**Payment Notifications**:
```typescript
usePaymentEvents(
  userId,
  (payment) => {
    // Payment received (pending approval)
    toast.info('Payment submitted for review');
  },
  (payment) => {
    // Payment approved
    toast.success('Payment approved! 🎉');
    mutate('/api/payments');
  }
);
```

**Score Notifications**:
```typescript
useScoreEvents(userId, (score) => {
  toast.success(`New score: ${score.score}/${score.maxScore} in ${score.courseTitle}`);
  mutate('/api/scores');
});
```

**Attendance Notifications**:
```typescript
useAttendanceEvents(userId, (attendance) => {
  const statusEmoji = {
    present: '✅',
    absent: '❌',
    late: '⏰',
    excused: '📝',
  };
  
  toast.info(`Attendance marked: ${statusEmoji[attendance.status]}`);
  mutate('/api/attendance');
});
```

### 3. Presence Indicators

**Who's Viewing Course**:
```typescript
'use client';

import { usePresence } from '@/lib/realtime/hooks';

export function CourseViewers({ courseId }) {
  const members = usePresence(`presence-course-${courseId}`);
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.slice(0, 3).map(member => (
          <div key={member.id} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white" />
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {members.length} viewing
      </span>
    </div>
  );
}
```

### 4. Public Announcements

**Platform-wide Announcements**:
```typescript
'use client';

import { usePublicAnnouncements } from '@/lib/realtime/hooks';

export function AnnouncementBanner() {
  const { announcements, dismissAnnouncement } = usePublicAnnouncements();
  
  return (
    <>
      {announcements.map(announcement => (
        <div key={announcement.timestamp} className="bg-blue-50 p-4">
          <h3>{announcement.title}</h3>
          <p>{announcement.message}</p>
          <button onClick={() => dismissAnnouncement(announcement)}>
            Dismiss
          </button>
        </div>
      ))}
    </>
  );
}
```

## 🔍 Event Types

### Dashboard Events
- `dashboard-update` - Full dashboard refresh
- `stats-update` - Stats only update

### Enrollment Events
- `new-enrollment` - New student enrolled
- `enrollment-update` - Enrollment status changed

### Payment Events
- `payment-received` - Payment submitted
- `payment-approved` - Payment approved by admin

### Score Events
- `new-score` - New score added
- `score-update` - Score updated

### Attendance Events
- `attendance-marked` - Attendance recorded

### Notification Events
- `new-notification` - General notification

## 💰 Cost Estimation

### Pusher Free Tier
- **Connections**: 100 concurrent
- **Messages**: 200,000 per day
- **Channels**: Unlimited
- **Cost**: $0/month

**Suitable for**:
- Development
- Small projects (< 100 concurrent users)
- Testing

### Pusher Startup Plan
- **Connections**: 500 concurrent
- **Messages**: 1,000,000 per day
- **Channels**: Unlimited
- **Cost**: $49/month

**Suitable for**:
- Production (100-500 users)
- Growing projects

### Pusher Professional Plan
- **Connections**: 2,000 concurrent
- **Messages**: 5,000,000 per day
- **Channels**: Unlimited
- **Cost**: $299/month

**Suitable for**:
- Large production (500-2000 users)
- High-traffic sites

## 🎯 Success Criteria

- ✅ Real-time infrastructure implemented
- ✅ React hooks created
- ✅ Notification component built
- ✅ Authentication endpoint ready
- ⏳ Events triggered from API endpoints (after deployment)
- ⏳ Live updates working (after deployment)
- ⏳ Notifications displaying (after deployment)
- ⏳ No connection issues (after deployment)

## 📝 Migration Checklist

- [x] Install pusher and pusher-js
- [x] Create Pusher client (server & client)
- [x] Create React hooks
- [x] Create notification component
- [x] Create authentication endpoint
- [x] Update .env.example
- [ ] Create Pusher account
- [ ] Add environment variables
- [ ] Add NotificationToast to layouts
- [ ] Trigger events from API endpoints
- [ ] Test real-time updates
- [ ] Monitor connection status
- [ ] Deploy to production

## 🚀 Next Steps

**Week 3**: Advanced Search
- Full-text search with PostgreSQL
- Search suggestions and autocomplete
- Faceted search with filters
- Search result highlighting

**Week 4**: Analytics & Reporting
- Advanced business intelligence
- Data export (CSV, Excel, PDF)
- Performance monitoring dashboard
- Custom report builder

## 📚 Resources

- [Pusher Docs](https://pusher.com/docs)
- [Pusher Channels](https://pusher.com/docs/channels)
- [React Integration](https://pusher.com/docs/channels/getting_started/react)
- [Authentication](https://pusher.com/docs/channels/server_api/authenticating-users)

---

**Status**: ✅ Week 2 Complete
**Started**: January 2025
**Target Completion**: Week 2 of Phase 4
