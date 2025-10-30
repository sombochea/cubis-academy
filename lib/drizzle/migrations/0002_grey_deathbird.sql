ALTER TABLE "user_sessions" ADD COLUMN "device_id" varchar(255);--> statement-breakpoint
CREATE INDEX "user_sessions_device_id_idx" ON "user_sessions" USING btree ("device_id");