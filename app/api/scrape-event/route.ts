import { NextRequest, NextResponse } from 'next/server';
import { EventScraper } from '@/lib/socialLayerScraper';
import { EventScrapeRequest, EventScrapeResult } from '@/types/event';

export async function POST(request: NextRequest) {
  try {
    const body: EventScrapeRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
          metadata: {
            url: '',
            scrapedAt: new Date().toISOString(),
            processingTime: 0,
          },
        } as EventScrapeResult,
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL format',
          metadata: {
            url: body.url,
            scrapedAt: new Date().toISOString(),
            processingTime: 0,
          },
        } as EventScrapeResult,
        { status: 400 }
      );
    }

    // Scrape the event
    const result = await EventScraper.scrapeEvent(body.url);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in scrape-event API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        metadata: {
          url: '',
          scrapedAt: new Date().toISOString(),
          processingTime: 0,
        },
      } as EventScrapeResult,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        error: 'URL parameter is required',
        metadata: {
          url: '',
          scrapedAt: new Date().toISOString(),
          processingTime: 0,
        },
      } as EventScrapeResult,
      { status: 400 }
    );
  }

  try {
    // Validate URL format
    new URL(url);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid URL format',
        metadata: {
          url,
          scrapedAt: new Date().toISOString(),
          processingTime: 0,
        },
      } as EventScrapeResult,
      { status: 400 }
    );
  }

  // Scrape the event
  const result = await EventScraper.scrapeEvent(url);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
