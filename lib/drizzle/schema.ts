import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  decimal,
  integer,
  date,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// UUID v7 generation function (requires uuid-ossp and pgcrypto extensions)
// Run: pnpm db:init
const uuidv7 = sql`uuid_generate_v7()`;

// Enums
export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "dropped",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
]);
export const courseLevelEnum = pgEnum("course_level", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const deliveryModeEnum = pgEnum("delivery_mode", [
  "online",
  "face_to_face",
  "hybrid",
]);
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerifiedAt: timestamp("email_verified_at"),
    phone: varchar("phone", { length: 50 }),
    photo: varchar("photo", { length: 500 }), // Profile photo URL
    role: roleEnum("role").notNull().default("student"),
    passHash: varchar("pass_hash", { length: 255 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    isActive: boolean("is_active").notNull().default(true),
    created: timestamp("created").notNull().defaultNow(),
    updated: timestamp("updated").notNull().defaultNow(),
  },
  (table) => [
    index("users_role_idx").on(table.role),
    index("users_is_active_idx").on(table.isActive),
    index("users_created_idx").on(table.created),
    index("users_email_verified_at_idx").on(table.emailVerifiedAt),
  ]
);

// Students table
export const students = pgTable(
  "students",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    suid: varchar("suid", { length: 20 }).notNull().unique(),
    dob: date("dob"),
    gender: varchar("gender", { length: 20 }),
    address: text("address"),
    photo: varchar("photo", { length: 500 }),
    enrolled: timestamp("enrolled").notNull().defaultNow(),
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  },
  (table) => [
    index("students_gender_idx").on(table.gender),
    index("students_enrolled_idx").on(table.enrolled),
  ]
);

// Teachers table
export const teachers = pgTable(
  "teachers",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    spec: varchar("spec", { length: 255 }),
    schedule: text("schedule"),
    photo: varchar("photo", { length: 500 }),
  },
  (table) => [index("teachers_spec_idx").on(table.spec)]
);

// File uploads table with metadata
export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    storageType: varchar("storage_type", { length: 50 })
      .notNull()
      .default("local"),
    category: varchar("category", { length: 50 }).notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    metadata: text("metadata"),
    created: timestamp("created").notNull().defaultNow(),
    updated: timestamp("updated").notNull().defaultNow(),
  },
  (table) => [
    index("uploads_user_id_idx").on(table.userId),
    index("uploads_category_idx").on(table.category),
  ]
);

// Course categories table (must be before courses table)
export const courseCategories = pgTable(
  "course_categories",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }),
    isActive: boolean("is_active").notNull().default(true),
    created: timestamp("created").notNull().defaultNow(),
    updated: timestamp("updated").notNull().defaultNow(),
  },
  (table) => [
    index("course_categories_name_idx").on(table.name),
    index("course_categories_slug_idx").on(table.slug),
    index("course_categories_is_active_idx").on(table.isActive),
  ]
);

// Courses table
export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    title: varchar("title", { length: 255 }).notNull(),
    desc: text("desc"),
    category: varchar("category", { length: 100 }), // Keep for backward compatibility
    categoryId: uuid("category_id").references(() => courseCategories.id, {
      onDelete: "set null",
    }),
    teacherId: uuid("teacher_id").references(() => teachers.userId, {
      onDelete: "set null",
    }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
    duration: integer("duration"),
    level: courseLevelEnum("level").notNull().default("beginner"),
    deliveryMode: deliveryModeEnum("delivery_mode")
      .notNull()
      .default("online"),
    location: text("location"), // Physical location for face-to-face/hybrid courses
    coverImage: varchar("cover_image", { length: 500 }),
    isActive: boolean("is_active").notNull().default(true),
    youtubeUrl: varchar("youtube_url", { length: 500 }),
    zoomUrl: varchar("zoom_url", { length: 500 }),
    created: timestamp("created").notNull().defaultNow(),
    updated: timestamp("updated").notNull().defaultNow(),
  },
  (table) => [
    index("courses_title_idx").on(table.title),
    index("courses_category_idx").on(table.category),
    index("courses_category_id_idx").on(table.categoryId),
    index("courses_teacher_id_idx").on(table.teacherId),
    index("courses_level_idx").on(table.level),
    index("courses_delivery_mode_idx").on(table.deliveryMode),
    index("courses_is_active_idx").on(table.isActive),
    index("courses_created_idx").on(table.created),
  ]
);

// Enrollments table
export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.userId, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: enrollmentStatusEnum("status").notNull().default("active"),
    progress: integer("progress").notNull().default(0),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"), // Total course price at enrollment time
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"), // Total amount paid so far
    enrolled: timestamp("enrolled").notNull().defaultNow(),
    completed: timestamp("completed"),
  },
  (table) => [
    unique().on(table.studentId, table.courseId),
    index("enrollments_student_id_idx").on(table.studentId),
    index("enrollments_course_id_idx").on(table.courseId),
    index("enrollments_status_idx").on(table.status),
    index("enrollments_enrolled_idx").on(table.enrolled),
    index("enrollments_completed_idx").on(table.completed),
  ]
);

// Payments table
// All payments MUST be linked to an enrollment (single source of truth)
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.userId, { onDelete: "cascade" }),
    enrollmentId: uuid("enrollment_id")
      .notNull() // ✅ Required - every payment must have an enrollment
      .references(() => enrollments.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: varchar("method", { length: 100 }),
    status: paymentStatusEnum("status").notNull().default("pending"),
    txnId: varchar("txn_id", { length: 255 }).unique(),
    proofUrl: varchar("proof_url", { length: 500 }), // Payment proof/receipt
    notes: text("notes"),
    created: timestamp("created").notNull().defaultNow(),
    approvedAt: timestamp("approved_at"), // When payment was approved
    rejectedAt: timestamp("rejected_at"), // When payment was rejected
  },
  (table) => [
    index("payments_student_id_idx").on(table.studentId),
    index("payments_enrollment_id_idx").on(table.enrollmentId),
    index("payments_method_idx").on(table.method),
    index("payments_status_idx").on(table.status),
    index("payments_created_idx").on(table.created),
    index("payments_student_created_idx").on(table.studentId, table.created),
  ]
);

// Scores table
export const scores = pgTable(
  "scores",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    score: decimal("score", { precision: 5, scale: 2 }).notNull(),
    maxScore: decimal("max_score", { precision: 5, scale: 2 })
      .notNull()
      .default("100"),
    remarks: text("remarks"),
    created: timestamp("created").notNull().defaultNow(),
  },
  (table) => [
    index("scores_enrollment_id_idx").on(table.enrollmentId),
    index("scores_created_idx").on(table.created),
    index("scores_enrollment_created_idx").on(
      table.enrollmentId,
      table.created
    ),
  ]
);

// Attendances table
export const attendances = pgTable(
  "attendances",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: attendanceStatusEnum("status").notNull().default("present"),
    notes: text("notes"),
    created: timestamp("created").notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.enrollmentId, table.date),
    index("attendances_enrollment_id_idx").on(table.enrollmentId),
    index("attendances_date_idx").on(table.date),
    index("attendances_status_idx").on(table.status),
  ]
);

// Teacher-Course assignments (many-to-many junction table)
export const teacherCourses = pgTable(
  "teacher_courses",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.userId, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.teacherId, table.courseId),
    index("teacher_courses_teacher_id_idx").on(table.teacherId),
    index("teacher_courses_course_id_idx").on(table.courseId),
  ]
);

// Course feedback/reviews table
export const courseFeedback = pgTable(
  "course_feedback",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.userId, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5 stars
    comment: text("comment"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    created: timestamp("created").notNull().defaultNow(),
    updated: timestamp("updated").notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.enrollmentId), // One feedback per enrollment
    index("course_feedback_student_id_idx").on(table.studentId),
    index("course_feedback_course_id_idx").on(table.courseId),
    index("course_feedback_rating_idx").on(table.rating),
    index("course_feedback_created_idx").on(table.created),
  ]
);

// Class schedules table
export const classSchedules = pgTable(
  "class_schedules",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format (e.g., "09:00")
    endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM format (e.g., "11:00")
    location: text("location"), // Physical location or online meeting link
    notes: text("notes"), // Additional notes about the class
    isActive: boolean("is_active").notNull().default(true),
    created: timestamp("created").notNull().defaultNow(),
    updated: timestamp("updated").notNull().defaultNow(),
  },
  (table) => [
    index("class_schedules_course_id_idx").on(table.courseId),
    index("class_schedules_day_of_week_idx").on(table.dayOfWeek),
    index("class_schedules_is_active_idx").on(table.isActive),
  ]
);

// Email verification codes table
export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    verified: boolean("verified").notNull().default(false),
    created: timestamp("created").notNull().defaultNow(),
  },
  (table) => [
    index("email_verification_codes_user_id_idx").on(table.userId),
    index("email_verification_codes_email_idx").on(table.email),
    index("email_verification_codes_code_idx").on(table.code),
    index("email_verification_codes_expires_at_idx").on(table.expiresAt),
  ]
);

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
  teacher: one(teachers, {
    fields: [courses.teacherId],
    references: [teachers.userId],
  }),
  enrollments: many(enrollments),
  payments: many(payments),
  schedules: many(classSchedules),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.userId],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  scores: many(scores),
  attendances: many(attendances),
  payments: many(payments),
  feedback: one(courseFeedback),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.userId],
  }),
  enrollment: one(enrollments, {
    fields: [payments.enrollmentId],
    references: [enrollments.id],
  }),
  // Course relation removed - access via enrollment.course instead
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [scores.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [attendances.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const uploadsRelations = relations(uploads, ({ one }) => ({
  user: one(users, { fields: [uploads.userId], references: [users.id] }),
}));

export const teacherCoursesRelations = relations(teacherCourses, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherCourses.teacherId],
    references: [teachers.userId],
  }),
  course: one(courses, {
    fields: [teacherCourses.courseId],
    references: [courses.id],
  }),
}));

export const emailVerificationCodesRelations = relations(
  emailVerificationCodes,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationCodes.userId],
      references: [users.id],
    }),
  })
);

// User sessions table for session management
export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    deviceId: varchar("device_id", { length: 255 }), // Persistent browser fingerprint
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    device: varchar("device", { length: 100 }),
    browser: varchar("browser", { length: 100 }),
    os: varchar("os", { length: 100 }),
    location: varchar("location", { length: 255 }),
    loginMethod: varchar("login_method", { length: 50 }), // 'credentials', 'google', 'oauth'
    isActive: boolean("is_active").notNull().default(true),
    lastActivity: timestamp("last_activity").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    created: timestamp("created").notNull().defaultNow(),
  },
  (table) => [
    index("user_sessions_user_id_idx").on(table.userId),
    index("user_sessions_session_token_idx").on(table.sessionToken),
    index("user_sessions_device_id_idx").on(table.deviceId),
    index("user_sessions_is_active_idx").on(table.isActive),
    index("user_sessions_expires_at_idx").on(table.expiresAt),
  ]
);

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const courseFeedbackRelations = relations(courseFeedback, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [courseFeedback.enrollmentId],
    references: [enrollments.id],
  }),
  student: one(students, {
    fields: [courseFeedback.studentId],
    references: [students.userId],
  }),
  course: one(courses, {
    fields: [courseFeedback.courseId],
    references: [courses.id],
  }),
}));

export const classSchedulesRelations = relations(classSchedules, ({ one }) => ({
  course: one(courses, {
    fields: [classSchedules.courseId],
    references: [courses.id],
  }),
}));
