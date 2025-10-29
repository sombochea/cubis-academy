CREATE TABLE "teacher_courses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"teacher_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teacher_courses_teacher_id_course_id_unique" UNIQUE("teacher_id","course_id")
);
--> statement-breakpoint
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_teacher_id_teachers_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "teacher_courses_teacher_id_idx" ON "teacher_courses" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "teacher_courses_course_id_idx" ON "teacher_courses" USING btree ("course_id");