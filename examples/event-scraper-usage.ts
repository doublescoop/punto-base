/**
 * Example usage of the SocialLayer Event Scraper
 * 
 * This file demonstrates how to use the event scraper in your Next.js application
 */

import { useState } from 'react';
import { EventApi } from '@/lib/eventApi';
import { SocialLayerEvent } from '@/types/event';

// Example 1: Basic usage with async/await
export async function scrapeEventExample() {
  const url = 'https://app.sola.day/event/detail/16716';
  
  try {
    const result = await EventApi.scrapeEvent(url);
    
    if (result.success && result.data) {
      console.log('Event scraped successfully:', result.data);
      return result.data;
    } else {
      console.error('Failed to scrape event:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Example 2: Using the scraper in a React component
export function useEventScraper() {
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<SocialLayerEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrapeEvent = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await EventApi.scrapeEvent(url);
      
      if (result.success && result.data) {
        setEventData(result.data);
      } else {
        setError(result.error || 'Failed to scrape event');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { scrapeEvent, eventData, isLoading, error };
}

// Example 3: Generate content suggestions for a zine
export async function generateZineContent(url: string) {
  const result = await EventApi.scrapeEvent(url);
  
  if (!result.success || !result.data) {
    return { suggestions: [], error: result.error };
  }

  const suggestions = EventApi.generateZineContentSuggestions(result);
  
  return {
    event: result.data,
    suggestions,
    metadata: result.metadata
  };
}

// Example 4: Server-side usage in an API route
export async function POST(request: Request) {
  const { url } = await request.json();
  
  if (!url) {
    return Response.json({ error: 'URL is required' }, { status: 400 });
  }

  const result = await EventApi.scrapeEvent(url);
  
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  // Generate content suggestions
  const suggestions = EventApi.generateZineContentSuggestions(result);
  
  return Response.json({
    event: result.data,
    suggestions,
    metadata: result.metadata
  });
}

// Example 5: Batch processing multiple events
export async function scrapeMultipleEvents(urls: string[]) {
  const results = await Promise.allSettled(
    urls.map(url => EventApi.scrapeEvent(url))
  );

  return results.map((result, index) => ({
    url: urls[index],
    success: result.status === 'fulfilled' && result.value.success,
    data: result.status === 'fulfilled' ? result.value.data : null,
    error: result.status === 'rejected' ? result.reason : 
           (result.status === 'fulfilled' && !result.value.success ? result.value.error : null)
  }));
}

// Example 6: Custom content generation based on event data
export function generateCustomZineContent(event: SocialLayerEvent) {
  const content = {
    title: `Post-Event Zine: ${event.title}`,
    sections: [
      {
        title: 'Event Recap',
        content: `We gathered on ${event.date} at ${event.location.name || event.location.address} for "${event.title}". ${event.description}`
      },
      {
        title: 'Key Themes',
        content: event.tags.map(tag => `• ${tag}`).join('\n')
      },
      {
        title: 'Community Highlights',
        content: `With ${event.participants.count} participants, this event brought together people passionate about ${event.category.toLowerCase()}.`
      },
      {
        title: 'Memorable Moments',
        content: 'Share your favorite moments, conversations, and insights from the event here.'
      },
      {
        title: 'TIL (Today I Learned)',
        content: 'What new knowledge, tools, or perspectives did you gain?'
      },
      {
        title: 'Connections Made',
        content: 'Who did you meet? What collaborations or friendships emerged?'
      },
      {
        title: 'Gratitude',
        content: `Special thanks to ${event.organizer.name} for organizing this amazing event!`
      }
    ]
  };

  return content;
}
