import { EventScrapeResult, EventScrapeRequest } from '@/types/event';

export class EventApi {
  private static readonly API_BASE = '/api';

  /**
   * Scrape a SocialLayer event page and return structured data
   * @param url - The SocialLayer event URL to scrape
   * @returns Promise<EventScrapeResult> - The scraped event data or error information
   */
  static async scrapeEvent(url: string): Promise<EventScrapeResult> {
    try {
      const response = await fetch(`${this.API_BASE}/scrape-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url } as EventScrapeRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return errorData;
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        metadata: {
          url,
          scrapedAt: new Date().toISOString(),
          processingTime: 0,
        },
      };
    }
  }

  /**
   * Scrape a SocialLayer event page using GET method (for simple URL passing)
   * @param url - The SocialLayer event URL to scrape
   * @returns Promise<EventScrapeResult> - The scraped event data or error information
   */
  static async scrapeEventGet(url: string): Promise<EventScrapeResult> {
    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await fetch(`${this.API_BASE}/scrape-event?url=${encodedUrl}`);

      if (!response.ok) {
        const errorData = await response.json();
        return errorData;
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        metadata: {
          url,
          scrapedAt: new Date().toISOString(),
          processingTime: 0,
        },
      };
    }
  }

  /**
   * Generate content suggestions for a post-event zine based on scraped event data
   * @param eventData - The scraped event data
   * @returns Array of content suggestions
   */
  static generateZineContentSuggestions(eventData: EventScrapeResult): string[] {
    if (!eventData.success || !eventData.data) {
      return ['Unable to generate suggestions - event data not available'];
    }

    const event = eventData.data;
    const suggestions: string[] = [];

    // Event-specific suggestions
    suggestions.push(`Event Recap: "${event.title}" - ${event.date}`);
    
    if (event.description) {
      suggestions.push(`Deep Dive: ${event.description.substring(0, 100)}...`);
    }

    // Location-based suggestions
    if (event.location.name) {
      suggestions.push(`Venue Spotlight: ${event.location.name}`);
    }
    if (event.location.city) {
      suggestions.push(`Local Insights: What made ${event.location.city} special?`);
    }

    // Organizer appreciation
    if (event.organizer.name !== 'Unknown Organizer') {
      suggestions.push(`Organizer Appreciation: Shoutout to ${event.organizer.name}`);
    }

    // Tag-based content ideas
    event.tags.forEach(tag => {
      suggestions.push(`Topic Discussion: ${tag} - What did you learn?`);
    });

    // Participant engagement
    if (event.participants.count > 0) {
      suggestions.push(`Community Moments: Share your favorite interaction with ${event.participants.count} participants`);
    }

    // Media and content
    if (event.content.media.length > 0) {
      suggestions.push(`Photo Gallery: Share your best shots from the event`);
    }
    if (event.content.comments > 0) {
      suggestions.push(`Discussion Highlights: Top insights from ${event.content.comments} comments`);
    }

    // Generic zine content ideas
    suggestions.push(
      'Memorable Moments: What made you laugh, think, or feel inspired?',
      'TIL (Today I Learned): Key takeaways and insights',
      'Connections Made: New friends, collaborators, or mentors',
      'Behind the Scenes: What the organizers did that made it special',
      'Anonymous Messages: Share thoughts without attribution',
      'Poetry Corner: Creative expressions inspired by the event',
      'Perks & Swag: What cool things did you get?',
      'Compliments Corner: Appreciate the people who made it happen',
      'Funny Moments: Memes, jokes, and lighthearted memories',
      'Future Ideas: What would you like to see next time?',
      'Gratitude Section: Thank you notes to organizers and participants',
      'Resource Sharing: Tools, links, and resources mentioned',
      'Action Items: What are you going to do differently because of this event?',
      'Community Building: How can we stay connected?',
      'Event Evolution: Suggestions for future improvements'
    );

    return suggestions;
  }
}
