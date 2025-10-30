CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
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
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_schedules_course_id_idx" ON "class_schedules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "class_schedules_day_of_week_idx" ON "class_schedules" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "class_schedules_is_active_idx" ON "class_schedules" USING btree ("is_active");