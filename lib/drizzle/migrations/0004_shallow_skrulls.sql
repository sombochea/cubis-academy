ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp;--> statement-breakpoint
CREATE INDEX "users_email_verified_at_idx" ON "users" USING btree ("email_verified_at");