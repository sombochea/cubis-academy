/**
 * Search Suggestions API
 * 
 * Returns autocomplete suggestions for search queries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/full-text-search';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await SearchService.getSuggestions(query, limit);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('[API] Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
