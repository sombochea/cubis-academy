/**
 * Course Search API
 * 
 * Full-text search for courses with filtering and pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/full-text-search';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    const { results, total } = await SearchService.searchCourses(query, {
      category,
      level,
      limit,
      offset,
    });

    // Add highlights to results
    const highlightedResults = results.map(result => ({
      ...result,
      titleHighlight: SearchService.highlightText(result.title, query),
      descHighlight: result.desc
        ? SearchService.extractSnippet(result.desc, query, 150)
        : null,
    }));

    return NextResponse.json({
      results: highlightedResults,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[API] Course search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
