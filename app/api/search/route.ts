import { NextRequest, NextResponse } from 'next/server';
import { extractTraits, rankBreeds } from '@/lib/traitExtractor';
import { breedsCache, CACHE_KEYS } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = CACHE_KEYS.SEARCH(query);
    const cachedResults = breedsCache.get<any[]>(cacheKey);
    if (cachedResults) {
      return NextResponse.json({
        success: true,
        cached: true,
        query,
        results: cachedResults.slice(0, limit),
        total: cachedResults.length,
      });
    }

    // Extract traits from natural language query
    const traits = extractTraits(query);
    console.log('=== SEARCH DEBUG ===');
    console.log('Query:', query);
    console.log('Extracted traits:', JSON.stringify(traits, null, 2));

    // Fetch all breeds from TheDogAPI
    let allBreeds = breedsCache.get<any[]>('all_breeds');
    if (!allBreeds) {
      const response = await fetch('https://api.thedogapi.com/v1/breeds', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_DOG_API_KEY || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch breeds from TheDogAPI');
      }

      allBreeds = await response.json();
      breedsCache.set(CACHE_KEYS.ALL_BREEDS, allBreeds);
    }

    // Rank and filter breeds based on extracted traits
    const rankedBreeds = rankBreeds(allBreeds || [], traits);
    console.log('Breeds after strict filtering:', rankedBreeds.length);
    console.log('===================');

    // Cache the results
    breedsCache.set(cacheKey, rankedBreeds);

    return NextResponse.json({
      success: true,
      cached: false,
      query,
      extractedTraits: traits,
      results: rankedBreeds.slice(0, limit),
      total: rankedBreeds.length,
      matchedBreeds: rankedBreeds.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search breeds', details: String(error) },
      { status: 500 }
    );
  }
}
