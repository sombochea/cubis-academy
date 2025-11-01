/**
 * Full-Text Search with PostgreSQL
 * 
 * Provides advanced search capabilities using PostgreSQL's
 * built-in full-text search features with tsvector and tsquery.
 */

import { db } from '@/lib/drizzle/db';
import { courses, users, teachers, students, courseCategories } from '@/lib/drizzle/schema';
import { sql, or, and, eq, ilike, desc } from 'drizzle-orm';
import { cache } from 'react';

/**
 * Search result types
 */
export interface CourseSearchResult {
  id: string;
  title: string;
  desc: string | null;
  category: string | null;
  categorySlug: string | null;
  level: string;
  price: string;
  duration: string | null;
  teacherId: string | null;
  teacherName: string | null;
  teacherPhoto: string | null;
  relevance: number;
  highlight?: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  role: string;
  photo: string | null;
  relevance: number;
  highlight?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'course' | 'teacher' | 'category';
  count: number;
}

/**
 * Full-text search service
 */
export class SearchService {
  /**
   * Search courses with full-text search
   * Uses PostgreSQL tsvector for fast, relevant results
   */
  static searchCourses = cache(async (
    query: string,
    options: {
      category?: string;
      level?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ results: CourseSearchResult[]; total: number }> => {
    const { category, level, limit = 20, offset = 0 } = options;

    if (!query || query.trim().length === 0) {
      return { results: [], total: 0 };
    }

    try {
      // Prepare search query (remove special characters, convert to tsquery format)
      const searchQuery = query
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => `${word}:*`)
        .join(' & ');

      // Build WHERE conditions
      const conditions = [
        eq(courses.isActive, true),
        sql`(
          to_tsvector('english', ${courses.title}) || 
          to_tsvector('english', COALESCE(${courses.desc}, ''))
        ) @@ to_tsquery('english', ${searchQuery})`,
      ];

      if (category) {
        conditions.push(eq(courses.category, category));
      }

      if (level) {
        conditions.push(eq(courses.level, level));
      }

      // Execute search with relevance ranking
      const results = await db
        .select({
          id: courses.id,
          title: courses.title,
          desc: courses.desc,
          category: courseCategories.name,
          categorySlug: courseCategories.slug,
          level: courses.level,
          price: courses.price,
          duration: courses.duration,
          teacherId: courses.teacherId,
          teacherName: users.name,
          teacherPhoto: teachers.photo,
          relevance: sql<number>`
            ts_rank(
              to_tsvector('english', ${courses.title}) || 
              to_tsvector('english', COALESCE(${courses.desc}, '')),
              to_tsquery('english', ${searchQuery})
            )
          `,
        })
        .from(courses)
        .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
        .leftJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
        .where(and(...conditions))
        .orderBy(desc(sql`relevance`))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count: total }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(and(...conditions));

      return {
        results: results as CourseSearchResult[],
        total: Number(total),
      };
    } catch (error) {
      console.error('[Search] Course search error:', error);
      return { results: [], total: 0 };
    }
  });

  /**
   * Search users (students and teachers)
   */
  static searchUsers = cache(async (
    query: string,
    options: {
      role?: 'student' | 'teacher' | 'admin';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ results: UserSearchResult[]; total: number }> => {
    const { role, limit = 20, offset = 0 } = options;

    if (!query || query.trim().length === 0) {
      return { results: [], total: 0 };
    }

    try {
      const searchQuery = query
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => `${word}:*`)
        .join(' & ');

      const conditions = [
        sql`(
          to_tsvector('english', ${users.name}) || 
          to_tsvector('english', ${users.email})
        ) @@ to_tsquery('english', ${searchQuery})`,
      ];

      if (role) {
        conditions.push(eq(users.role, role));
      }

      const results = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          photo: sql<string | null>`
            CASE 
              WHEN ${users.role} = 'student' THEN ${students.photo}
              WHEN ${users.role} = 'teacher' THEN ${teachers.photo}
              ELSE NULL
            END
          `,
          relevance: sql<number>`
            ts_rank(
              to_tsvector('english', ${users.name}) || 
              to_tsvector('english', ${users.email}),
              to_tsquery('english', ${searchQuery})
            )
          `,
        })
        .from(users)
        .leftJoin(students, eq(users.id, students.userId))
        .leftJoin(teachers, eq(users.id, teachers.userId))
        .where(and(...conditions))
        .orderBy(desc(sql`relevance`))
        .limit(limit)
        .offset(offset);

      const [{ count: total }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(...conditions));

      return {
        results: results as UserSearchResult[],
        total: Number(total),
      };
    } catch (error) {
      console.error('[Search] User search error:', error);
      return { results: [], total: 0 };
    }
  });

  /**
   * Get search suggestions based on partial query
   */
  static getSuggestions = cache(async (
    query: string,
    limit: number = 5
  ): Promise<SearchSuggestion[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const suggestions: SearchSuggestion[] = [];

      // Course title suggestions
      const courseSuggestions = await db
        .select({
          text: courses.title,
          count: sql<number>`count(*)`,
        })
        .from(courses)
        .where(
          and(
            eq(courses.isActive, true),
            ilike(courses.title, `%${query}%`)
          )
        )
        .groupBy(courses.title)
        .orderBy(desc(sql`count(*)`))
        .limit(limit);

      suggestions.push(
        ...courseSuggestions.map(s => ({
          text: s.text,
          type: 'course' as const,
          count: Number(s.count),
        }))
      );

      // Teacher name suggestions
      const teacherSuggestions = await db
        .select({
          text: users.name,
          count: sql<number>`count(*)`,
        })
        .from(users)
        .where(
          and(
            eq(users.role, 'teacher'),
            ilike(users.name, `%${query}%`)
          )
        )
        .groupBy(users.name)
        .orderBy(desc(sql`count(*)`))
        .limit(limit);

      suggestions.push(
        ...teacherSuggestions.map(s => ({
          text: s.text,
          type: 'teacher' as const,
          count: Number(s.count),
        }))
      );

      // Category suggestions
      const categorySuggestions = await db
        .select({
          text: courseCategories.name,
          count: sql<number>`count(*)`,
        })
        .from(courseCategories)
        .where(ilike(courseCategories.name, `%${query}%`))
        .groupBy(courseCategories.name)
        .orderBy(desc(sql`count(*)`))
        .limit(limit);

      suggestions.push(
        ...categorySuggestions.map(s => ({
          text: s.text,
          type: 'category' as const,
          count: Number(s.count),
        }))
      );

      // Sort by relevance and limit
      return suggestions
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('[Search] Suggestions error:', error);
      return [];
    }
  });

  /**
   * Get popular search terms
   */
  static getPopularSearches = cache(async (
    limit: number = 10
  ): Promise<string[]> => {
    try {
      // Get most common course titles (as proxy for popular searches)
      const popular = await db
        .select({
          title: courses.title,
        })
        .from(courses)
        .where(eq(courses.isActive, true))
        .orderBy(desc(courses.created))
        .limit(limit);

      return popular.map(p => p.title);
    } catch (error) {
      console.error('[Search] Popular searches error:', error);
      return [];
    }
  });

  /**
   * Highlight search terms in text
   */
  static highlightText(text: string, query: string): string {
    if (!query || !text) return text;

    const terms = query.trim().split(/\s+/);
    let highlighted = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(
        regex,
        '<mark class="bg-yellow-200 text-[#17224D] font-semibold">$1</mark>'
      );
    });

    return highlighted;
  }

  /**
   * Extract snippet from text around search terms
   */
  static extractSnippet(
    text: string,
    query: string,
    maxLength: number = 150
  ): string {
    if (!text || !query) return text?.substring(0, maxLength) || '';

    const terms = query.trim().split(/\s+/);
    const lowerText = text.toLowerCase();

    // Find first occurrence of any search term
    let firstIndex = -1;
    for (const term of terms) {
      const index = lowerText.indexOf(term.toLowerCase());
      if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
        firstIndex = index;
      }
    }

    if (firstIndex === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    // Extract snippet around the term
    const start = Math.max(0, firstIndex - 50);
    const end = Math.min(text.length, firstIndex + maxLength - 50);
    
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }
}

/**
 * Simple search (fallback for when full-text search is not available)
 */
export class SimpleSearchService {
  /**
   * Simple ILIKE-based course search
   */
  static searchCourses = cache(async (
    query: string,
    options: {
      category?: string;
      level?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ results: CourseSearchResult[]; total: number }> => {
    const { category, level, limit = 20, offset = 0 } = options;

    if (!query || query.trim().length === 0) {
      return { results: [], total: 0 };
    }

    try {
      const searchPattern = `%${query}%`;
      
      const conditions = [
        eq(courses.isActive, true),
        or(
          ilike(courses.title, searchPattern),
          ilike(courses.desc, searchPattern)
        ),
      ];

      if (category) {
        conditions.push(eq(courses.category, category));
      }

      if (level) {
        conditions.push(eq(courses.level, level));
      }

      const results = await db
        .select({
          id: courses.id,
          title: courses.title,
          desc: courses.desc,
          category: courseCategories.name,
          categorySlug: courseCategories.slug,
          level: courses.level,
          price: courses.price,
          duration: courses.duration,
          teacherId: courses.teacherId,
          teacherName: users.name,
          teacherPhoto: teachers.photo,
          relevance: sql<number>`1`,
        })
        .from(courses)
        .leftJoin(teachers, eq(courses.teacherId, teachers.userId))
        .leftJoin(users, eq(teachers.userId, users.id))
        .leftJoin(courseCategories, eq(courses.category, courseCategories.slug))
        .where(and(...conditions))
        .orderBy(desc(courses.created))
        .limit(limit)
        .offset(offset);

      const [{ count: total }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(and(...conditions));

      return {
        results: results as CourseSearchResult[],
        total: Number(total),
      };
    } catch (error) {
      console.error('[Search] Simple course search error:', error);
      return { results: [], total: 0 };
    }
  });
}
