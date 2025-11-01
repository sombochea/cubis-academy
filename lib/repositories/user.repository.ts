/**
 * User Repository
 * 
 * Handles all database operations related to users.
 */

import { cache } from 'react';
import { db } from '@/lib/drizzle/db';
import { users, students, teachers } from '@/lib/drizzle/schema';
import { eq, and, desc, count, sql, or } from 'drizzle-orm';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository {
  /**
   * Get user by ID
   */
  static getUserById = cache(async (userId: string) => {
    return await this.executeQuery(`getUserById:${userId}`, async () => {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          created: users.created,
        })
        .from(users)
        .where(eq(users.id, userId));

      return user;
    });
  });

  /**
   * Get user by email
   */
  static getUserByEmail = cache(async (email: string) => {
    return await this.executeQuery(`getUserByEmail:${email}`, async () => {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          created: users.created,
        })
        .from(users)
        .where(eq(users.email, email));

      return user;
    });
  });

  /**
   * Get all users with role filter
   */
  static getAllUsers = cache(async (role?: string) => {
    return await this.executeQuery('getAllUsers', async () => {
      const query = db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          created: users.created,
        })
        .from(users)
        .orderBy(desc(users.created));

      if (role) {
        return await query.where(eq(users.role, role as any));
      }

      return await query;
    });
  });

  /**
   * Get user statistics by role
   */
  static getUserStatsByRole = cache(async () => {
    return await this.executeQuery('getUserStatsByRole', async () => {
      const [stats] = await db
        .select({
          totalUsers: sql<number>`count(*)::int`,
          students: sql<number>`count(case when ${users.role} = 'student' then 1 end)::int`,
          teachers: sql<number>`count(case when ${users.role} = 'teacher' then 1 end)::int`,
          admins: sql<number>`count(case when ${users.role} = 'admin' then 1 end)::int`,
          activeUsers: sql<number>`count(case when ${users.isActive} = true then 1 end)::int`,
          verifiedEmails: sql<number>`count(case when ${users.emailVerified} is not null then 1 end)::int`,
        })
        .from(users);

      return stats || {
        totalUsers: 0,
        students: 0,
        teachers: 0,
        admins: 0,
        activeUsers: 0,
        verifiedEmails: 0,
      };
    });
  });

  /**
   * Search users by name or email
   */
  static searchUsers = cache(async (searchTerm: string) => {
    return await this.executeQuery(`searchUsers:${searchTerm}`, async () => {
      return await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          created: users.created,
        })
        .from(users)
        .where(
          or(
            sql`${users.name} ILIKE ${`%${searchTerm}%`}`,
            sql`${users.email} ILIKE ${`%${searchTerm}%`}`
          )
        )
        .orderBy(desc(users.created))
        .limit(50);
    });
  });

  /**
   * Get user with profile (student or teacher)
   */
  static getUserWithProfile = cache(async (userId: string) => {
    return await this.executeQuery(`getUserWithProfile:${userId}`, async () => {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          created: users.created,
          // Student fields
          studentPhoto: students.photo,
          studentDob: students.dob,
          studentGender: students.gender,
          studentAddress: students.address,
          studentEnrolled: students.enrolled,
          // Teacher fields
          teacherPhoto: teachers.photo,
          teacherBio: teachers.bio,
          teacherSpec: teachers.spec,
          teacherSchedule: teachers.schedule,
        })
        .from(users)
        .leftJoin(students, eq(users.id, students.userId))
        .leftJoin(teachers, eq(users.id, teachers.userId))
        .where(eq(users.id, userId));

      return user;
    });
  });

  /**
   * Check if email exists
   */
  static emailExists = cache(async (email: string): Promise<boolean> => {
    return await this.executeQuery(`emailExists:${email}`, async () => {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return !!user;
    });
  });

  /**
   * Get total users count
   */
  static getTotalUsersCount = cache(async () => {
    return await this.executeQuery('getTotalUsersCount', async () => {
      const [result] = await db
        .select({ count: count() })
        .from(users);

      return result?.count || 0;
    });
  });

  /**
   * Get active users count
   */
  static getActiveUsersCount = cache(async () => {
    return await this.executeQuery('getActiveUsersCount', async () => {
      const [result] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.isActive, true));

      return result?.count || 0;
    });
  });

  /**
   * Get recent users (last N)
   */
  static getRecentUsers = cache(async (limit: number = 10) => {
    return await this.executeQuery(`getRecentUsers:${limit}`, async () => {
      return await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          created: users.created,
        })
        .from(users)
        .orderBy(desc(users.created))
        .limit(limit);
    });
  });
}
