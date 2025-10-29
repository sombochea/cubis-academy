import { pgTable, uuid, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// File uploads table with metadata
export const uploads = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // Who uploaded it
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  filePath: varchar('file_path', { length: 500 }).notNull(), // storage path
  fileUrl: varchar('file_url', { length: 500 }).notNull(), // public URL
  storageType: varchar('storage_type', { length: 50 }).notNull().default('local'), // local, s3, r2
  category: varchar('category', { length: 50 }).notNull(), // profile, document, course_material, etc.
  isPublic: boolean('is_public').notNull().default(false),
  metadata: text('metadata'), // JSON string for additional data
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow(),
});

export const uploadsRelations = relations(uploads, ({ one }) => ({
  // Can add relations to users table if needed
}));
