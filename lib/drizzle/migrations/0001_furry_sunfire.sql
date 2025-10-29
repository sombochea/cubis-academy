CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY NOT NULL,
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
ALTER TABLE "attendances" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scores" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "photo" varchar(500);--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "uploads_user_id_idx" ON "uploads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "uploads_category_idx" ON "uploads" USING btree ("category");--> statement-breakpoint
CREATE INDEX "attendances_enrollment_id_idx" ON "attendances" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "attendances_date_idx" ON "attendances" USING btree ("date");--> statement-breakpoint
CREATE INDEX "attendances_status_idx" ON "attendances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "courses_title_idx" ON "courses" USING btree ("title");--> statement-breakpoint
CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "courses_teacher_id_idx" ON "courses" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "courses_level_idx" ON "courses" USING btree ("level");--> statement-breakpoint
CREATE INDEX "courses_is_active_idx" ON "courses" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "courses_created_idx" ON "courses" USING btree ("created");--> statement-breakpoint
CREATE INDEX "enrollments_student_id_idx" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "enrollments_course_id_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "enrollments_status_idx" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "enrollments_enrolled_idx" ON "enrollments" USING btree ("enrolled");--> statement-breakpoint
CREATE INDEX "enrollments_completed_idx" ON "enrollments" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "payments_student_id_idx" ON "payments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "payments_course_id_idx" ON "payments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_created_idx" ON "payments" USING btree ("created");--> statement-breakpoint
CREATE INDEX "payments_student_created_idx" ON "payments" USING btree ("student_id","created");--> statement-breakpoint
CREATE INDEX "scores_enrollment_id_idx" ON "scores" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "scores_created_idx" ON "scores" USING btree ("created");--> statement-breakpoint
CREATE INDEX "scores_enrollment_created_idx" ON "scores" USING btree ("enrollment_id","created");--> statement-breakpoint
CREATE INDEX "students_gender_idx" ON "students" USING btree ("gender");--> statement-breakpoint
CREATE INDEX "students_enrolled_idx" ON "students" USING btree ("enrolled");--> statement-breakpoint
CREATE INDEX "teachers_spec_idx" ON "teachers" USING btree ("spec");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_created_idx" ON "users" USING btree ("created");