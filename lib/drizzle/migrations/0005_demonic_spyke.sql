CREATE TYPE "public"."delivery_mode" AS ENUM('online', 'face_to_face', 'hybrid');--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'refunded';--> statement-breakpoint
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
ALTER TABLE "courses" ADD COLUMN "delivery_mode" "delivery_mode" DEFAULT 'online' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "total_amount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "enrollment_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "proof_url" varchar(500);--> statement-breakpoint
ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_feedback" ADD CONSTRAINT "course_feedback_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_feedback_student_id_idx" ON "course_feedback" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "course_feedback_course_id_idx" ON "course_feedback" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_feedback_rating_idx" ON "course_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "course_feedback_created_idx" ON "course_feedback" USING btree ("created");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_delivery_mode_idx" ON "courses" USING btree ("delivery_mode");--> statement-breakpoint
CREATE INDEX "payments_enrollment_id_idx" ON "payments" USING btree ("enrollment_id");