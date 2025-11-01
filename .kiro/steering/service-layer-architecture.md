# Service Layer Architecture & Performance Optimization

## Current Problems

### 1. Direct Database Access in Pages
- ❌ Database queries scattered across page components
- ❌ Duplicate queries in multiple places
- ❌ Hard to maintain and test
- ❌ No caching strategy
- ❌ Tight coupling between UI and data layer

### 2. Performance Issues
- ❌ Slow initial page loads (blank screen)
- ❌ Slow navigation between pages
- ❌ No streaming or progressive rendering
- ❌ Large data fetching blocking render
- ❌ No parallel data fetching

### 3. Code Organization
- ❌ Business logic mixed with UI code
- ❌ No separation of concerns
- ❌ Difficult to reuse queries
- ❌ Hard to add caching or optimization

## Solution: Service Layer Architecture

### Architecture Layers

```
┌─────────────────────────────────────────┐
│         UI Layer (Pages/Components)      │
│  - Presentation logic only               │
│  - No direct DB access                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Service Layer                    │
│  - Business logic                        │
│  - Data transformation                   │
│  - Caching strategies                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Repository Layer                 │
│  - Database queries                      │
│  - Data access logic                     │
│  - Query optimization                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Database (PostgreSQL)            │
└─────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Create Repository Layer

**Location**: `lib/repositories/`

**Purpose**: Encapsulate all database queries

**Structure**:
```
lib/repositories/
├── base.repository.ts          # Base repository with common methods
├── user.repository.ts           # User queries
├── course.repository.ts         # Course queries
├── enrollment.repository.ts     # Enrollment queries
├── payment.repository.ts        # Payment queries
├── teacher.repository.ts        # Teacher queries
├── student.repository.ts        # Student queries
├── score.repository.ts          # Score queries
├── attendance.repository.ts     # Attendance queries
└── index.ts                     # Export all repositories
```

**Example Repository**:
```typescript
// lib/repositories/course.repository.ts
import { db } from '@/lib/drizzle/db';
import { courses, teachers, users, courseCategories } from '@/lib/drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { cache } from 'react';

export class CourseRepository {
  // Get all active courses with teacher info
  static getActiveCourses = cache(async () => {
    return await db
      .select({
        id: courses.id,
        title: courses.title,
        desc: courses.desc,
        category: courseCategories.name,
        categorySlug: courseCategories.slug,
        level: courses.level,
        price: courses.price,
        duration: courses.duration,
        deliveryMode: courses.deliveryMode,
        teacherId: courses.teacherId,
        teacherName: users.name,
        teacherPhoto: teachers.photo,
        created: courses.created,
      })
      .from(courses)
      .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
      .leftJoin(users, eq(teachers.userId, users.id))
      .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
      .where(eq(courses.isActive, true))
      .orderBy(desc(courses.created));
  });

  // Get course by ID with full details
  static getCourseById = cache(async (courseId: string) => {
    const [course] = await db
      .select({
        id: courses.id,
        title: courses.title,
        desc: courses.desc,
        category: courseCategories.name,
        categorySlug: courseCategories.slug,
        level: courses.level,
        price: courses.price,
        duration: courses.duration,
        deliveryMode: courses.deliveryMode,
        location: courses.location,
        youtubeUrl: courses.youtubeUrl,
        zoomUrl: courses.zoomUrl,
        isActive: courses.isActive,
        teacherId: courses.teacherId,
        teacherName: users.name,
        teacherEmail: users.email,
        teacherPhoto: teachers.photo,
        teacherBio: teachers.bio,
        teacherSpec: teachers.spec,
        created: courses.created,
        updated: courses.updated,
      })
      .from(courses)
      .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
      .leftJoin(users, eq(teachers.userId, users.id))
      .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
      .where(eq(courses.id, courseId));

    return course;
  });

  // Get courses by teacher ID
  static getCoursesByTeacherId = cache(async (teacherId: string) => {
    return await db
      .select({
        id: courses.id,
        title: courses.title,
        desc: courses.desc,
        category: courseCategories.name,
        level: courses.level,
        isActive: courses.isActive,
        created: courses.created,
      })
      .from(courses)
      .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(courses.created));
  });

  // Get course statistics
  static getCourseStats = cache(async (courseId: string) => {
    const [stats] = await db
      .select({
        totalEnrollments: sql<number>`count(distinct ${enrollments.id})`,
        activeEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'active' then ${enrollments.id} end)`,
        completedEnrollments: sql<number>`count(distinct case when ${enrollments.status} = 'completed' then ${enrollments.id} end)`,
        totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(payments, eq(enrollments.id, payments.enrollmentId))
      .where(eq(courses.id, courseId));

    return stats;
  });
}
```

### Phase 2: Create Service Layer

**Location**: `lib/services/`

**Purpose**: Business logic, data transformation, caching

**Structure**:
```
lib/services/
├── course.service.ts           # Course business logic
├── enrollment.service.ts       # Enrollment business logic
├── payment.service.ts          # Payment business logic
├── teacher.service.ts          # Teacher business logic
├── student.service.ts          # Student business logic
├── analytics.service.ts        # Analytics and reporting
└── index.ts                    # Export all services
```

**Example Service**:
```typescript
// lib/services/course.service.ts
import { CourseRepository } from '@/lib/repositories/course.repository';
import { EnrollmentRepository } from '@/lib/repositories/enrollment.repository';
import { cache } from 'react';

export class CourseService {
  // Get courses with enrollment counts
  static getCoursesWithStats = cache(async () => {
    const courses = await CourseRepository.getActiveCourses();
    
    // Parallel fetch enrollment counts
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await EnrollmentRepository.getEnrollmentCount(course.id);
        return {
          ...course,
          enrollmentCount,
        };
      })
    );

    return coursesWithStats;
  });

  // Get course details with related data
  static getCourseDetails = cache(async (courseId: string, userId?: string) => {
    // Parallel fetch all related data
    const [course, stats, schedules, isEnrolled] = await Promise.all([
      CourseRepository.getCourseById(courseId),
      CourseRepository.getCourseStats(courseId),
      ScheduleRepository.getCourseSchedules(courseId),
      userId ? EnrollmentRepository.isUserEnrolled(userId, courseId) : false,
    ]);

    return {
      course,
      stats,
      schedules,
      isEnrolled,
    };
  });

  // Get teacher's courses with statistics
  static getTeacherCoursesWithStats = cache(async (teacherId: string) => {
    const courses = await CourseRepository.getCoursesByTeacherId(teacherId);
    
    // Parallel fetch stats for all courses
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const stats = await CourseRepository.getCourseStats(course.id);
        return {
          ...course,
          ...stats,
        };
      })
    );

    return coursesWithStats;
  });
}
```

### Phase 3: Update Pages to Use Services

**Before (Direct DB Access)**:
```typescript
// app/[locale]/(teacher)/teacher/courses/page.tsx
export default async function TeacherCoursesPage() {
  const session = await auth();
  
  // ❌ Direct database query in page
  const courses = await db
    .select({
      id: courses.id,
      title: courses.title,
      // ... many fields
    })
    .from(courses)
    .where(eq(courses.teacherId, session.user.id));

  return <CoursesDataTable data={courses} />;
}
```

**After (Service Layer)**:
```typescript
// app/[locale]/(teacher)/teacher/courses/page.tsx
import { CourseService } from '@/lib/services/course.service';

export default async function TeacherCoursesPage() {
  const session = await auth();
  
  // ✅ Use service layer
  const courses = await CourseService.getTeacherCoursesWithStats(session.user.id);

  return <CoursesDataTable data={courses} />;
}
```

## Performance Optimization Strategies

### 1. React Cache (Deduplication)

**Purpose**: Deduplicate identical requests during render

```typescript
import { cache } from 'react';

export const getCourses = cache(async () => {
  return await db.select().from(courses);
});

// Multiple calls in same render = single DB query
const courses1 = await getCourses();
const courses2 = await getCourses(); // Uses cached result
```

### 2. Parallel Data Fetching

**Before (Sequential)**:
```typescript
// ❌ Slow: 3 seconds total (1s + 1s + 1s)
const courses = await getCourses();        // 1 second
const enrollments = await getEnrollments(); // 1 second
const payments = await getPayments();       // 1 second
```

**After (Parallel)**:
```typescript
// ✅ Fast: 1 second total (all parallel)
const [courses, enrollments, payments] = await Promise.all([
  getCourses(),        // 1 second
  getEnrollments(),    // 1 second (parallel)
  getPayments(),       // 1 second (parallel)
]);
```

### 3. Streaming with Suspense

**Purpose**: Show content progressively, no blank screen

```typescript
// app/[locale]/(teacher)/teacher/courses/page.tsx
import { Suspense } from 'react';

export default function TeacherCoursesPage() {
  return (
    <div>
      <h1>My Courses</h1>
      
      {/* Show stats immediately */}
      <Suspense fallback={<StatsLoading />}>
        <CourseStats />
      </Suspense>

      {/* Show courses list while loading */}
      <Suspense fallback={<CoursesLoading />}>
        <CoursesList />
      </Suspense>
    </div>
  );
}

// Separate component for stats (can load independently)
async function CourseStats() {
  const stats = await CourseService.getTeacherStats(session.user.id);
  return <StatsCards data={stats} />;
}

// Separate component for courses (can load independently)
async function CoursesList() {
  const courses = await CourseService.getTeacherCourses(session.user.id);
  return <CoursesDataTable data={courses} />;
}
```

### 4. Partial Prerendering (PPR)

**Purpose**: Static shell + dynamic content

```typescript
// next.config.js
module.exports = {
  experimental: {
    ppr: true, // Enable Partial Prerendering
  },
};

// app/[locale]/(teacher)/teacher/courses/page.tsx
export const experimental_ppr = true;

export default function TeacherCoursesPage() {
  return (
    <div>
      {/* Static: Rendered at build time */}
      <h1>My Courses</h1>
      <Navigation />

      {/* Dynamic: Rendered on request */}
      <Suspense fallback={<Loading />}>
        <CoursesList />
      </Suspense>
    </div>
  );
}
```

### 5. Incremental Static Regeneration (ISR)

**Purpose**: Static pages that update periodically

```typescript
// app/[locale]/(student)/student/courses/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function CoursesPage() {
  const courses = await CourseService.getActiveCourses();
  return <CoursesGrid courses={courses} />;
}
```

### 6. Database Query Optimization

**Indexed Queries**:
```typescript
// ✅ Use indexed columns in WHERE clauses
.where(eq(courses.teacherId, teacherId)) // teacherId is indexed

// ✅ Use indexed columns in ORDER BY
.orderBy(desc(courses.created)) // created is indexed

// ❌ Avoid functions in WHERE (can't use index)
.where(sql`LOWER(${courses.title}) = 'test'`)
```

**Select Only Needed Columns**:
```typescript
// ❌ Select all columns (slow)
const courses = await db.select().from(courses);

// ✅ Select only needed columns (fast)
const courses = await db
  .select({
    id: courses.id,
    title: courses.title,
    price: courses.price,
  })
  .from(courses);
```

**Use Joins Instead of Multiple Queries**:
```typescript
// ❌ N+1 query problem
const courses = await db.select().from(courses);
for (const course of courses) {
  const teacher = await db.select().from(teachers).where(eq(teachers.id, course.teacherId));
}

// ✅ Single query with join
const courses = await db
  .select({
    courseId: courses.id,
    courseTitle: courses.title,
    teacherName: users.name,
  })
  .from(courses)
  .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
  .leftJoin(users, eq(teachers.userId, users.id));
```

### 7. Client-Side Caching with SWR

**Purpose**: Cache data on client, revalidate in background

```typescript
// components/CoursesList.tsx
'use client';

import useSWR from 'swr';

export function CoursesList({ initialData }) {
  const { data, error, isLoading } = useSWR(
    '/api/courses',
    fetcher,
    {
      fallbackData: initialData, // Use server data initially
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <CoursesGrid courses={data} />;
}
```

## Migration Strategy

### Step 1: Create Base Repository (Week 1)

1. Create `lib/repositories/base.repository.ts`
2. Create `lib/repositories/course.repository.ts`
3. Create `lib/repositories/enrollment.repository.ts`
4. Test repositories in isolation

### Step 2: Create Services (Week 1-2)

1. Create `lib/services/course.service.ts`
2. Create `lib/services/enrollment.service.ts`
3. Add caching with React cache()
4. Add parallel data fetching

### Step 3: Migrate Teacher Portal (Week 2)

1. Update teacher courses page
2. Update teacher course details page
3. Update teacher students page
4. Add Suspense boundaries
5. Test performance improvements

### Step 4: Migrate Student Portal (Week 3)

1. Update student courses page
2. Update student enrollments page
3. Update student dashboard
4. Add Suspense boundaries
5. Test performance improvements

### Step 5: Migrate Admin Portal (Week 3-4)

1. Update admin dashboard
2. Update admin courses page
3. Update admin students page
4. Add Suspense boundaries
5. Test performance improvements

### Step 6: Optimize & Monitor (Week 4)

1. Add performance monitoring
2. Optimize slow queries
3. Add more caching where needed
4. Document patterns and best practices

## Performance Targets

### Current Performance
- ❌ Initial page load: 3-5 seconds
- ❌ Navigation: 2-3 seconds
- ❌ Blank screen: 1-2 seconds

### Target Performance
- ✅ Initial page load: <1 second
- ✅ Navigation: <500ms
- ✅ No blank screen (streaming)
- ✅ Time to Interactive: <2 seconds

## Benefits

### Code Quality
- ✅ Separation of concerns
- ✅ Reusable code
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ Type-safe

### Performance
- ✅ Faster page loads
- ✅ No blank screens
- ✅ Progressive rendering
- ✅ Optimized queries
- ✅ Efficient caching

### Developer Experience
- ✅ Clear architecture
- ✅ Easy to add features
- ✅ Easy to debug
- ✅ Consistent patterns
- ✅ Better collaboration

## Best Practices

### 1. Always Use cache() for Data Fetching

```typescript
import { cache } from 'react';

export const getData = cache(async () => {
  return await db.select().from(table);
});
```

### 2. Fetch Data in Parallel

```typescript
const [data1, data2, data3] = await Promise.all([
  getData1(),
  getData2(),
  getData3(),
]);
```

### 3. Use Suspense for Progressive Rendering

```typescript
<Suspense fallback={<Loading />}>
  <DataComponent />
</Suspense>
```

### 4. Select Only Needed Columns

```typescript
.select({
  id: table.id,
  name: table.name,
  // Only what you need
})
```

### 5. Use Indexed Columns in Queries

```typescript
.where(eq(table.indexedColumn, value))
.orderBy(desc(table.indexedColumn))
```

## Monitoring & Debugging

### Performance Monitoring

```typescript
// lib/utils/performance.ts
export async function measureQuery<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  console.log(`[Query] ${name}: ${duration.toFixed(2)}ms`);
  
  return result;
}

// Usage
const courses = await measureQuery('getCourses', () =>
  CourseRepository.getActiveCourses()
);
```

### Query Logging

```typescript
// Enable in development
if (process.env.NODE_ENV === 'development') {
  db.$on('query', (e) => {
    console.log('Query:', e.query);
    console.log('Duration:', e.duration, 'ms');
  });
}
```

## Status

📋 **PLANNED** - Ready for implementation

## Next Steps

1. Review and approve architecture
2. Create base repository and service classes
3. Start migration with teacher portal
4. Measure performance improvements
5. Document patterns for team

