import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean, decimal, integer, date, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['student', 'teacher', 'admin']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'completed', 'dropped']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late']);
export const courseLevelEnum = pgEnum('course_level', ['beginner', 'intermediate', 'advanced']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  role: roleEnum('role').notNull().default('student'),
  passHash: varchar('pass_hash', { length: 255 }),
  googleId: varchar('google_id', { length: 255 }).unique(),
  isActive: boolean('is_active').notNull().default(true),
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow(),
});

// Students table
export const students = pgTable('students', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  suid: varchar('suid', { length: 20 }).notNull().unique(),
  dob: date('dob'),
  gender: varchar('gender', { length: 20 }),
  address: text('address'),
  photo: varchar('photo', { length: 500 }),
  enrolled: timestamp('enrolled').notNull().defaultNow(),
});

// Teachers table
export const teachers = pgTable('teachers', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  spec: varchar('spec', { length: 255 }),
  schedule: text('schedule'),
});

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  category: varchar('category', { length: 100 }),
  teacherId: uuid('teacher_id').references(() => teachers.userId, { onDelete: 'set null' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0'),
  duration: integer('duration'),
  level: courseLevelEnum('level').notNull().default('beginner'),
  isActive: boolean('is_active').notNull().default(true),
  youtubeUrl: varchar('youtube_url', { length: 500 }),
  zoomUrl: varchar('zoom_url', { length: 500 }),
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow(),
});

// Enrollments table
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.userId, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  status: enrollmentStatusEnum('status').notNull().default('active'),
  progress: integer('progress').notNull().default(0),
  enrolled: timestamp('enrolled').notNull().defaultNow(),
  completed: timestamp('completed'),
}, (table) => ({
  uniqueEnrollment: unique().on(table.studentId, table.courseId),
}));

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.userId, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: varchar('method', { length: 100 }),
  status: paymentStatusEnum('status').notNull().default('pending'),
  txnId: varchar('txn_id', { length: 255 }).unique(),
  notes: text('notes'),
  created: timestamp('created').notNull().defaultNow(),
});

// Scores table
export const scores = pgTable('scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').notNull().references(() => enrollments.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  score: decimal('score', { precision: 5, scale: 2 }).notNull(),
  maxScore: decimal('max_score', { precision: 5, scale: 2 }).notNull().default('100'),
  remarks: text('remarks'),
  created: timestamp('created').notNull().defaultNow(),
});

// Attendances table
export const attendances = pgTable('attendances', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').notNull().references(() => enrollments.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  status: attendanceStatusEnum('status').notNull().default('present'),
  notes: text('notes'),
  created: timestamp('created').notNull().defaultNow(),
}, (table) => ({
  uniqueAttendance: unique().on(table.enrollmentId, table.date),
}));

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, { fields: [users.id], references: [students.userId] }),
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  enrollments: many(enrollments),
  payments: many(payments),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(teachers, { fields: [courses.teacherId], references: [teachers.userId] }),
  enrollments: many(enrollments),
  payments: many(payments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.userId] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
  scores: many(scores),
  attendances: many(attendances),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, { fields: [payments.studentId], references: [students.userId] }),
  course: one(courses, { fields: [payments.courseId], references: [courses.id] }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  enrollment: one(enrollments, { fields: [scores.enrollmentId], references: [enrollments.id] }),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  enrollment: one(enrollments, { fields: [attendances.enrollmentId], references: [enrollments.id] }),
}));
