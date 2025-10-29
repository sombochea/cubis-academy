CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'teacher', 'admin');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"notes" text,
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendances_enrollment_id_date_unique" UNIQUE("enrollment_id","date")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"desc" text,
	"category" varchar(100),
	"teacher_id" uuid,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"duration" integer,
	"level" "course_level" DEFAULT 'beginner' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"youtube_url" varchar(500),
	"zoom_url" varchar(500),
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"enrolled" timestamp DEFAULT now() NOT NULL,
	"completed" timestamp,
	CONSTRAINT "enrollments_student_id_course_id_unique" UNIQUE("student_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"method" varchar(100),
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"txn_id" varchar(255),
	"notes" text,
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_txn_id_unique" UNIQUE("txn_id")
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"score" numeric(5, 2) NOT NULL,
	"max_score" numeric(5, 2) DEFAULT '100' NOT NULL,
	"remarks" text,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"suid" varchar(20) NOT NULL,
	"dob" date,
	"gender" varchar(20),
	"address" text,
	"photo" varchar(500),
	"enrolled" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_suid_unique" UNIQUE("suid")
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"bio" text,
	"spec" varchar(255),
	"schedule" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"role" "role" DEFAULT 'student' NOT NULL,
	"pass_hash" varchar(255),
	"google_id" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_teachers_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;