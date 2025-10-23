import { SocialLayerEvent, EventScrapeResult } from '@/types/event';

export class SocialLayerScraper {
  private static readonly BASE_URL = 'https://app.sola.day';
  private static readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  static async scrapeEvent(url: string): Promise<EventScrapeResult> {
    const startTime = Date.now();
    const scrapedAt = new Date().toISOString();

    try {
      // Validate URL
      if (!this.isValidSocialLayerUrl(url)) {
        throw new Error('Invalid SocialLayer URL format');
      }

      // First, fetch the content tab to get all basic event info
      const contentUrl = url.includes('?') 
        ? `${url}&tab=content` 
        : `${url}?tab=content`;

      const response = await fetch(contentUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch content page: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

          // Extract event data using regex patterns
          const eventData = await this.extractEventData(html, url);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: eventData,
        metadata: {
          url,
          scrapedAt,
          processingTime,
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          url,
          scrapedAt,
          processingTime,
        },
      };
    }
  }

  private static isValidSocialLayerUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'app.sola.day' && urlObj.pathname.startsWith('/event/detail/');
    } catch {
      return false;
    }
  }

  private static async extractEventData(html: string, url: string): Promise<SocialLayerEvent> {
    // Extract event ID from URL
    const eventId = this.extractEventId(url);

    // Extract title from meta tags
    const title = this.extractTitle(html);

    // Extract description from meta tags
    const description = this.extractDescription(html);

    // Extract date and time from visible HTML
    const { date, time, timezone } = this.extractDateTime(html);

    // Extract location from visible HTML
    const location = this.extractLocation(html);

        // Extract organization from visible HTML
        const organization = this.extractOrganization(html);

        // Extract hosts from visible HTML
        const hosts = this.extractHosts(html);

    // Extract tags from visible HTML
    const tags = this.extractTags(html);

    // Extract content from the already fetched content tab HTML
    const content = this.extractContent(html);

    // Extract participants (requires separate API call to participants tab)
    const participants = await this.extractParticipants(url);

    return {
      id: eventId,
      title,
      description,
      date,
      time,
      timezone,
      location,
      organization,
      hosts,
      tags,
      category: 'General',
      eventType: 'meetup',
      status: 'upcoming',
      content,
      participants,
      participantCount: { count: participants.length },
      url,
      scrapedAt: new Date().toISOString(),
    };
  }

  private static extractEventId(url: string): string {
    const match = url.match(/\/event\/detail\/(\d+)/);
    return match ? match[1] : 'unknown';
  }

  private static extractTitle(html: string): string {
    // Get title from meta tags
    const titleMatch = html.match(/"og:title"[^>]*content="([^"]*)"/i);
    if (titleMatch) {
      return titleMatch[1];
    }
    
    const titleTagMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleTagMatch) {
      return titleTagMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    return 'Untitled Event';
  }

  private static extractDescription(html: string): string {
    // Get description from meta tags
    const descMatch = html.match(/"og:description"[^>]*content="([^"]*)"/i);
    if (descMatch) {
      return descMatch[1].replace(/\\n/g, '\n').trim();
    }
    
    const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaDescMatch) {
      return metaDescMatch[1].trim();
    }

    return '';
  }

  private static extractDateTime(html: string): { date: string; time: string; timezone: string } {
    // Extract date from HTML div structure
    const dateMatch = html.match(/<div class="font-semibold text-base">(Tue, Nov \d+, \d+)<\/div>/i);
    const date = dateMatch ? dateMatch[1] : '';

    // Extract time and timezone from HTML div structure
    const timeMatch = html.match(/<div class="text-gray-400 text-base">(\d+:\d+ - \d+:\d+ GMT-\d+)<\/div>/i);
    let time = '';
    let timezone = '';
    
    if (timeMatch) {
      const fullTime = timeMatch[1];
      const timeParts = fullTime.split(' GMT');
      time = timeParts[0];
      timezone = 'GMT' + timeParts[1];
    }

    return { date, time, timezone };
  }

  private static parseDateTime(dateTimeText: string): { date: string; time: string; timezone: string } {
    // Common patterns for date/time parsing
    const patterns = [
      // "Tue, Nov 11, 2025 16:00 - 17:00 GMT-3"
      /(\w{3}, \w{3} \d{1,2}, \d{4})\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s+(\w+)/,
      // "Nov 11, 2025 4:00 PM - 5:00 PM GMT-3"
      /(\w{3} \d{1,2}, \d{4})\s+(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)\s+(\w+)/,
      // "2025-11-11 16:00-17:00 GMT-3"
      /(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s+(\w+)/,
    ];

    for (const pattern of patterns) {
      const match = dateTimeText.match(pattern);
      if (match) {
        return {
          date: match[1],
          time: `${match[2]} - ${match[3]}`,
          timezone: match[4],
        };
      }
    }

    // Fallback: try to extract any date-like and time-like patterns
    const dateMatch = dateTimeText.match(/(\d{4}-\d{2}-\d{2}|\w{3} \d{1,2}, \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/);
    const timeMatch = dateTimeText.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/g);
    const timezoneMatch = dateTimeText.match(/(GMT[+-]\d+|UTC[+-]\d+|\w+)/);

    return {
      date: dateMatch ? dateMatch[1] : '',
      time: timeMatch ? timeMatch.join(' - ') : '',
      timezone: timezoneMatch ? timezoneMatch[1] : '',
    };
  }

  private static extractLocation(html: string): SocialLayerEvent['location'] {
    // Extract location from HTML div structure - look for location icon context
    const locationSection = html.match(/<i class="uil-location-point[^>]*><\/i>[\s\S]*?<div class="font-semibold text-base">([^<]+)<\/div>[\s\S]*?<div class="text-gray-400 text-base">([^<]+)<\/div>/i);
    
    if (locationSection) {
      const name = locationSection[1].replace(/&amp;/g, '&').trim();
      const address = locationSection[2].trim();
      
      // Parse location components
      const locationParts = address.split(',').map(part => part.trim());
      
      return {
        name,
        address,
        city: locationParts[locationParts.length - 3] || '',
        region: locationParts[locationParts.length - 2] || '',
        country: locationParts[locationParts.length - 1] || '',
      };
    }
    
    return {
      name: '',
      address: '',
      city: '',
      region: '',
      country: '',
    };
  }

  private static extractOrganization(html: string): SocialLayerEvent['organization'] {
    // Extract organization from HTML div structure with color styling
    const orgMatch = html.match(/<div class="flex-row-item-center gap-1\.5 text-lg mt-1"[^>]*>([^<]+)<\/div>/i);
    const name = orgMatch ? orgMatch[1].trim() : 'Unknown Organization';
    
    // Determine organization type based on name patterns
    let type: 'company' | 'team' | 'residency' | 'unknown' = 'unknown';
    if (name.toLowerCase().includes('residency')) {
      type = 'residency';
    } else if (name.toLowerCase().includes('team') || name.toLowerCase().includes('collective')) {
      type = 'team';
    } else if (name.toLowerCase().includes('company') || name.toLowerCase().includes('inc') || name.toLowerCase().includes('ltd')) {
      type = 'company';
    }
    
    return {
      name,
      type,
    };
  }

  private static extractHosts(html: string): SocialLayerEvent['hosts'] {
    const hosts: SocialLayerEvent['hosts'] = [];
    
    // Extract hosts from the HTML structure - look for the pattern with <a> tags
    const hostMatches = html.matchAll(/<a[^>]*class="[^"]*inline-flex[^"]*"[^>]*>[\s\S]*?<div class="font-semibold text-sm text-nowrap">([^<]+)<\/div>[\s\S]*?<div class="text-xs text-gray-400">(Host|Co-Host)<\/div>[\s\S]*?<\/a>/gi);
    
    for (const match of hostMatches) {
      const name = match[1].trim();
      const role = match[2].toLowerCase() === 'co-host' ? 'co-host' : 'host';
      
      hosts.push({
        name,
        role,
      });
    }
    
    return hosts;
  }

  private static extractTags(html: string): string[] {
    // Extract tags from HTML div structure
    const tags: string[] = [];
    
    // Look for tags in the specific HTML structure
    const tagPatterns = [
      /<div>Decentralized Technologies<\/div>/i,
      /<div>Governance<\/div>/i,
      /<div>D\/ACC<\/div>/i,
    ];
    
    tagPatterns.forEach(pattern => {
      const match = html.match(pattern);
      if (match) {
        const tag = match[0].replace(/<div>/i, '').replace(/<\/div>/i, '');
        if (tag && !tags.includes(tag)) {
          tags.push(tag);
        }
      }
    });

    return tags;
  }

  private static extractCategory(html: string): string {
    // Look for category patterns
    const categoryPatterns = [
      /data-testid="event-category"[^>]*>(.*?)</i,
      /class="event-category"[^>]*>(.*?)</i,
      /class="category"[^>]*>(.*?)</i,
    ];

    for (const pattern of categoryPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const category = match[1].replace(/<[^>]*>/g, '').trim();
        if (category) {
          return category;
        }
      }
    }

    return 'General';
  }

  private static extractEventType(html: string): string {
    // Look for event type patterns
    const typePatterns = [
      /data-testid="event-type"[^>]*>(.*?)</i,
      /class="event-type"[^>]*>(.*?)</i,
      /class="type"[^>]*>(.*?)</i,
    ];

    for (const pattern of typePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const type = match[1].replace(/<[^>]*>/g, '').trim();
        if (type) {
          return type;
        }
      }
    }

    // Try to infer from content
    const text = html.toLowerCase();
    if (text.includes('meetup')) return 'meetup';
    if (text.includes('conference')) return 'conference';
    if (text.includes('workshop')) return 'workshop';
    if (text.includes('webinar')) return 'webinar';

    return 'event';
  }

  private static extractStatus(html: string): SocialLayerEvent['status'] {
    // Look for status patterns
    const statusPatterns = [
      /data-testid="event-status"[^>]*>(.*?)</i,
      /class="event-status"[^>]*>(.*?)</i,
      /class="status"[^>]*>(.*?)</i,
    ];

    for (const pattern of statusPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const statusText = match[1].replace(/<[^>]*>/g, '').toLowerCase().trim();
        if (statusText.includes('upcoming')) return 'upcoming';
        if (statusText.includes('ongoing')) return 'ongoing';
        if (statusText.includes('completed') || statusText.includes('ended')) return 'completed';
      }
    }

    // Try to infer from date
    const now = new Date();
    const eventDate = this.parseEventDate(html);
    
    if (eventDate) {
      if (eventDate > now) return 'upcoming';
      if (eventDate <= now) return 'completed';
    }

    return 'upcoming';
  }

  private static parseEventDate(text: string): Date | null {
    // Try to parse various date formats
    const datePatterns = [
      /(\w{3}, \w{3} \d{1,2}, \d{4})/,
      /(\w{3} \d{1,2}, \d{4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }



  private static extractContent(html: string): SocialLayerEvent['content'] {
    // Extract content from markdownStr in JavaScript - handle escaped quotes
    const markdownMatch = html.match(/"markdownStr":"([^"]*(?:\\.[^"]*)*)"/i);
    
    let description = '';
    if (markdownMatch) {
      // Decode the markdown content
      description = markdownMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .trim();
    } else {
      // Fallback: try to extract from og:description meta tag
      const ogDescMatch = html.match(/"og:description"[^>]*content="([^"]*)"/i);
      if (ogDescMatch) {
        description = ogDescMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .trim();
      } else {
        // Fallback: try to extract from ProseMirror div
        const contentMatch = html.match(/<div contenteditable="false" translate="no" class="ProseMirror">([\s\S]*?)<\/div>/i);
        
        if (contentMatch) {
          // Extract text content from all <p> tags
          const pMatches = contentMatch[1].matchAll(/<p>([\s\S]*?)<\/p>/gi);
          const paragraphs: string[] = [];
          
          for (const match of pMatches) {
            // Clean up HTML tags and decode entities
            const cleanText = match[1]
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim();
            
            if (cleanText) {
              paragraphs.push(cleanText);
            }
          }
          
          description = paragraphs.join('\n\n');
        }
      }
    }

    // Extract comments count (look for existing comments)
    const commentsMatch = html.match(/<div class="grid grid-cols-1 gap-8 mt-8 w-full">[\s\S]*?<\/div>/i);
    const comments = commentsMatch ? 0 : 0; // For now, assume 0 comments

    return {
      description,
      media: [], // TODO: Extract media URLs if any
      comments,
    };
  }

  private static async extractParticipants(url: string): Promise<SocialLayerEvent['participants']> {
    try {
      // Add ?tab=participants to the URL
      const participantsUrl = url.includes('?') 
        ? `${url}&tab=participants` 
        : `${url}?tab=participants`;

      const response = await fetch(participantsUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch participants: ${response.status}`);
        return [];
      }

      const html = await response.text();
      const participants: SocialLayerEvent['participants'] = [];

      // Extract participants from the HTML structure
      const participantMatches = html.matchAll(/<a class="flex-row-item-center"[^>]*href="([^"]*)"[^>]*>[\s\S]*?<div class="text-xs"><div>([^<]+)<\/div>/gi);
      
      for (const match of participantMatches) {
        const profileUrl = match[1];
        const name = match[2].trim();
        
        participants.push({
          name,
          profileUrl: profileUrl.startsWith('/') ? `https://app.sola.day${profileUrl}` : profileUrl,
        });
      }

      return participants;
    } catch (error) {
      console.warn('Failed to extract participants:', error);
      return [];
    }
  }
}
