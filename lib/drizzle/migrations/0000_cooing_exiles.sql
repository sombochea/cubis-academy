CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'late');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TYPE "public"."delivery_mode" AS ENUM('online', 'face_to_face', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'teacher', 'admin');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" DEFAULT 'present' NOT NULL,
	"notes" text,
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendances_enrollment_id_date_unique" UNIQUE("enrollment_id","date")
);
--> statement-breakpoint
CREATE TABLE "class_schedules" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"course_id" uuid NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"location" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_categories" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"color" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "course_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_feedback" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_feedback_enrollment_id_unique" UNIQUE("enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" varchar(255) NOT NULL,
	"desc" text,
	"category" varchar(100),
	"category_id" uuid,
	"teacher_id" uuid,
	"price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"duration" integer,
	"level" "course_level" DEFAULT 'beginner' NOT NULL,
	"delivery_mode" "delivery_mode" DEFAULT 'online' NOT NULL,
	"location" text,
	"cover_image" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"youtube_url" varchar(500),
	"zoom_url" varchar(500),
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_codes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"student_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"enrolled" timestamp DEFAULT now() NOT NULL,
	"completed" timestamp,
	CONSTRAINT "enrollments_student_id_course_id_unique" UNIQUE("student_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"student_id" uuid NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" varchar(100),
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"txn_id" varchar(255),
	"proof_url" varchar(500),
	"notes" text,
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_txn_id_unique" UNIQUE("txn_id")
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
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
CREATE TABLE "teacher_courses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teacher_courses_teacher_id_course_id_unique" UNIQUE("teacher_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"bio" text,
	"spec" varchar(255),
	"schedule" text,
	"photo" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"storage_type" varchar(50) DEFAULT 'local' NOT NULL,
	"category" varchar(50) NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" text,
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"device_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"device" varchar(100),
	"browser" varchar(100),
	"os" varchar(100),
	"location" varchar(255),
	"login_method" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" timestamp,
	"phone" varchar(50),
	"photo" varchar(500),
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
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_teachers_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_codes" ADD CONSTRAINT "email_verification_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_teacher_id_teachers_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendances_enrollment_id_idx" ON "attendances" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "attendances_date_idx" ON "attendances" USING btree ("date");--> statement-breakpoint
CREATE INDEX "attendances_status_idx" ON "attendances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "class_schedules_course_id_idx" ON "class_schedules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "class_schedules_day_of_week_idx" ON "class_schedules" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "class_schedules_is_active_idx" ON "class_schedules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "course_categories_name_idx" ON "course_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "course_categories_slug_idx" ON "course_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "course_categories_is_active_idx" ON "course_categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "course_feedback_student_id_idx" ON "course_feedback" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "course_feedback_course_id_idx" ON "course_feedback" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_feedback_rating_idx" ON "course_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "course_feedback_created_idx" ON "course_feedback" USING btree ("created");--> statement-breakpoint
CREATE INDEX "courses_title_idx" ON "courses" USING btree ("title");--> statement-breakpoint
CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "courses_category_id_idx" ON "courses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "courses_teacher_id_idx" ON "courses" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "courses_level_idx" ON "courses" USING btree ("level");--> statement-breakpoint
CREATE INDEX "courses_delivery_mode_idx" ON "courses" USING btree ("delivery_mode");--> statement-breakpoint
CREATE INDEX "courses_is_active_idx" ON "courses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "courses_created_idx" ON "courses" USING btree ("created");--> statement-breakpoint
CREATE INDEX "email_verification_codes_user_id_idx" ON "email_verification_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_codes_email_idx" ON "email_verification_codes" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_verification_codes_code_idx" ON "email_verification_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "email_verification_codes_expires_at_idx" ON "email_verification_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "enrollments_student_id_idx" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "enrollments_course_id_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enrollments_enrolled_idx" ON "enrollments" USING btree ("enrolled");--> statement-breakpoint
CREATE INDEX "enrollments_completed_idx" ON "enrollments" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "payments_student_id_idx" ON "payments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "payments_enrollment_id_idx" ON "payments" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_created_idx" ON "payments" USING btree ("created");--> statement-breakpoint
CREATE INDEX "payments_student_created_idx" ON "payments" USING btree ("student_id","created");--> statement-breakpoint
CREATE INDEX "scores_enrollment_id_idx" ON "scores" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "scores_created_idx" ON "scores" USING btree ("created");--> statement-breakpoint
CREATE INDEX "scores_enrollment_created_idx" ON "scores" USING btree ("enrollment_id","created");--> statement-breakpoint
CREATE INDEX "students_gender_idx" ON "students" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "students_enrolled_idx" ON "students" USING btree ("enrolled");--> statement-breakpoint
CREATE INDEX "teacher_courses_teacher_id_idx" ON "teacher_courses" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "teacher_courses_course_id_idx" ON "teacher_courses" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "teachers_spec_idx" ON "teachers" USING btree ("spec");--> statement-breakpoint
CREATE INDEX "uploads_user_id_idx" ON "uploads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "uploads_category_idx" ON "uploads" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_session_token_idx" ON "user_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "user_sessions_device_id_idx" ON "user_sessions" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "user_sessions_is_active_idx" ON "user_sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_created_idx" ON "users" USING btree ("created");--> statement-breakpoint
CREATE INDEX "users_email_verified_at_idx" ON "users" USING btree ("email_verified_at");