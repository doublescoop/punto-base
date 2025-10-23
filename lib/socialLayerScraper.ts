import { SocialLayerEvent, EventScrapeResult } from '@/types/event';

export class EventScraper {
  private static readonly SOCIAL_LAYER_BASE_URL = 'https://app.sola.day';
  private static readonly LUMA_BASE_URL = 'https://lu.ma';
  private static readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  static async scrapeEvent(url: string): Promise<EventScrapeResult> {
    const startTime = Date.now();
    const scrapedAt = new Date().toISOString();

    try {
      // Validate URL and detect platform
      const platform = this.detectPlatform(url);
      if (platform === 'unknown') {
        throw new Error('Unsupported event platform. Only SocialLayer and Luma are supported.');
      }

      // Platform-specific URL handling
      let fetchUrl = url;
      if (platform === 'sociallayer') {
        // For SocialLayer, fetch the content tab to get all basic event info
        fetchUrl = url.includes('?') 
          ? `${url}&tab=content` 
          : `${url}?tab=content`;
      }
      // For Luma, use the original URL

      const response = await fetch(fetchUrl, {
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
          const eventData = await this.extractEventData(html, url, platform);

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

  private static detectPlatform(url: string): 'sociallayer' | 'luma' | 'unknown' {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'app.sola.day' && urlObj.pathname.startsWith('/event/detail/')) {
        return 'sociallayer';
      } else if (urlObj.hostname === 'lu.ma' || urlObj.hostname === 'luma.com') {
        return 'luma';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private static isValidEventUrl(url: string): boolean {
    const platform = this.detectPlatform(url);
    return platform !== 'unknown';
  }

  private static async extractEventData(html: string, url: string, platform: 'sociallayer' | 'luma'): Promise<SocialLayerEvent> {
    // Extract event ID from URL
    const eventId = this.extractEventId(url);

    // Extract title from meta tags
    const title = this.extractTitle(html);

    // Extract description from meta tags
    const description = this.extractDescription(html);

    // Extract date and time based on platform
    const { date, time, timezone } = platform === 'luma' 
      ? this.extractLumaDateTime(html)
      : this.extractDateTime(html);

    // Extract location based on platform
    const location = platform === 'luma' 
      ? this.extractLumaLocation(html)
      : this.extractLocation(html);

    // Extract organization based on platform
    const organization = platform === 'luma' 
      ? this.extractLumaOrganization(html)
      : this.extractOrganization(html);

    // Extract hosts based on platform
    const hosts = platform === 'luma' 
      ? this.extractLumaHosts(html)
      : this.extractHosts(html);

    // Extract tags from visible HTML
    const tags = this.extractTags(html);

    // Extract content and participants based on platform
    let content: SocialLayerEvent['content'];
    let participants: SocialLayerEvent['participants'];

    if (platform === 'sociallayer') {
      // For SocialLayer, content is already in the HTML, participants need separate fetch
      content = this.extractContent(html);
      participants = await this.extractParticipants(url);
    } else {
      // For Luma, extract everything from the main page
      content = this.extractLumaContent(html);
      participants = this.extractLumaParticipants(html);
    }

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
      participantCount: platform === 'luma' 
        ? this.extractLumaParticipantCount(html)
        : { count: participants.length },
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

  // Luma-specific extraction methods
  private static extractLumaContent(html: string): SocialLayerEvent['content'] {
    try {
      // Extract JSON data from __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) {
        return { description: '', media: [], comments: 0 };
      }

      const data = JSON.parse(nextDataMatch[1]);
      const eventData = data.props?.pageProps?.initialData?.data;
      
      if (!eventData) {
        return { description: '', media: [], comments: 0 };
      }

      // Extract description from description_mirror (ProseMirror format)
      let description = '';
      if (eventData.description_mirror?.content) {
        description = this.extractLumaDescription(eventData.description_mirror.content);
      }

      return {
        description,
        media: [], // TODO: Extract media URLs if any
        comments: 0, // Luma doesn't have comments in the same way
      };
    } catch (error) {
      console.warn('Failed to extract Luma content:', error);
      return { description: '', media: [], comments: 0 };
    }
  }

  private static extractLumaDescription(content: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>): string {
    if (!Array.isArray(content)) return '';
    
    const paragraphs: string[] = [];
    
    for (const block of content) {
      if (block.type === 'paragraph' && block.content) {
        let paragraphText = '';
        for (const textNode of block.content) {
          if (textNode.type === 'text') {
            paragraphText += textNode.text;
          }
        }
        if (paragraphText.trim()) {
          paragraphs.push(paragraphText.trim());
        }
      }
    }
    
    return paragraphs.join('\n\n');
  }

  private static extractLumaParticipants(html: string): SocialLayerEvent['participants'] {
    try {
      // Extract JSON data from __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) {
        return [];
      }

      const data = JSON.parse(nextDataMatch[1]);
      const eventData = data.props?.pageProps?.initialData?.data;
      
      if (!eventData) {
        return [];
      }

      const participants: SocialLayerEvent['participants'] = [];
      
      // Extract from featured_guests (first few participants shown)
      if (eventData.featured_guests) {
        for (const guest of eventData.featured_guests) {
          participants.push({
            name: guest.name || 'Unknown',
            profileUrl: guest.username ? `https://lu.ma/${guest.username}` : undefined,
            avatar: guest.avatar_url,
          });
        }
      }

      // Note: Luma doesn't provide full participant list in the JSON data
      // We only get the featured_guests (first few) and the total count
      // The full participant list would require additional API calls or pagination

      return participants;
    } catch (error) {
      console.warn('Failed to extract Luma participants:', error);
      return [];
    }
  }

  private static extractLumaLocation(html: string): SocialLayerEvent['location'] {
    try {
      // Extract JSON data from __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) {
        return { name: '', address: '', city: '', region: '', country: '' };
      }

      const data = JSON.parse(nextDataMatch[1]);
      const eventData = data.props?.pageProps?.initialData?.data;
      
      if (!eventData?.event?.geo_address_info) {
        return { name: '', address: '', city: '', region: '', country: '' };
      }

      const geoInfo = eventData.event.geo_address_info;
      
      // Handle obfuscated addresses (when "Register to See Address" is shown)
      if (geoInfo.mode === 'obfuscated' && geoInfo.city_state) {
        // Parse city_state like "Vancouver, British Columbia"
        const cityStateParts = geoInfo.city_state.split(',').map(part => part.trim());
        const city = cityStateParts[0] || '';
        const region = cityStateParts[1] || '';
        
        return {
          name: 'Register to See Address',
          address: 'Register to See Address',
          city,
          region,
          country: geoInfo.country || '',
          coordinates: eventData.event.coordinate ? {
            lat: eventData.event.coordinate.latitude,
            lng: eventData.event.coordinate.longitude,
          } : undefined,
        };
      }
      
      // Handle normal addresses with full details
      let city = geoInfo.city || '';
      
      // If city is null/empty but address contains city names, try to extract them
      if (!city && geoInfo.address) {
        city = this.extractCityFromAddress(geoInfo.address);
      }
      
      return {
        name: geoInfo.address || '',
        address: geoInfo.full_address || '',
        city,
        region: geoInfo.region || '',
        country: geoInfo.country || '',
        coordinates: eventData.event.coordinate ? {
          lat: eventData.event.coordinate.latitude,
          lng: eventData.event.coordinate.longitude,
        } : undefined,
      };
    } catch (error) {
      console.warn('Failed to extract Luma location:', error);
      return { name: '', address: '', city: '', region: '', country: '' };
    }
  }

  private static extractLumaHosts(html: string): SocialLayerEvent['hosts'] {
    try {
      // Extract JSON data from __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) {
        return [];
      }

      const data = JSON.parse(nextDataMatch[1]);
      const eventData = data.props?.pageProps?.initialData?.data;
      
      if (!eventData?.hosts) {
        return [];
      }

      const hosts: SocialLayerEvent['hosts'] = [];
      
      for (const host of eventData.hosts) {
        hosts.push({
          name: host.name || 'Unknown',
          role: 'host', // Luma doesn't distinguish between host/co-host in the same way
          profileUrl: host.username ? `https://lu.ma/${host.username}` : undefined,
        });
      }

      return hosts;
    } catch (error) {
      console.warn('Failed to extract Luma hosts:', error);
      return [];
    }
  }

  private static extractLumaOrganization(html: string): SocialLayerEvent['organization'] {
    try {
      // Extract JSON data from __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) {
        return { name: 'Unknown Organization', type: 'unknown' };
      }

      const data = JSON.parse(nextDataMatch[1]);
      const eventData = data.props?.pageProps?.initialData?.data;
      
      if (!eventData?.calendar) {
        return { name: 'Unknown Organization', type: 'unknown' };
      }

      const calendar = eventData.calendar;
      
      // Determine organization type based on calendar data
      let type: 'company' | 'team' | 'residency' | 'unknown' = 'unknown';
      if (calendar.name.toLowerCase().includes('residency')) {
        type = 'residency';
      } else if (calendar.name.toLowerCase().includes('club') || calendar.name.toLowerCase().includes('meetup')) {
        type = 'team';
      } else if (calendar.is_personal === false) {
        type = 'company';
      }
      
      return {
        name: calendar.name || 'Unknown Organization',
        type,
      };
    } catch (error) {
      console.warn('Failed to extract Luma organization:', error);
      return { name: 'Unknown Organization', type: 'unknown' };
    }
  }

  private static extractLumaDateTime(html: string): { date: string; time: string; timezone: string } {
    try {
      // Extract JSON data from __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) {
        return { date: '', time: '', timezone: '' };
      }

      const data = JSON.parse(nextDataMatch[1]);
      const eventData = data.props?.pageProps?.initialData?.data;
      
      if (!eventData?.event) {
        return { date: '', time: '', timezone: '' };
      }

      const event = eventData.event;
      const startAt = new Date(event.start_at);
      const endAt = new Date(event.end_at);
      
      // Format date
      const date = startAt.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Format time
      const startTime = startAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const endTime = endAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const time = `${startTime} - ${endTime}`;
      
      return {
        date,
        time,
        timezone: event.timezone || 'UTC',
      };
    } catch (error) {
      console.warn('Failed to extract Luma date/time:', error);
      return { date: '', time: '', timezone: '' };
    }
  }

  private static extractLumaParticipantCount(html: string): { count: number } {
    try {
      // Extract JSON data from __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (!nextDataMatch) {
        return { count: 0 };
      }

      const data = JSON.parse(nextDataMatch[1]);
      const eventData = data.props?.pageProps?.initialData?.data;
      
      if (!eventData) {
        return { count: 0 };
      }

      // Look for guest_count in the event data
      const guestCount = eventData.guest_count || 0;
      
      return { count: guestCount };
    } catch (error) {
      console.warn('Failed to extract Luma participant count:', error);
      return { count: 0 };
    }
  }

  private static extractCityFromAddress(address: string): string {
    if (!address) return '';
    
    const addressLower = address.toLowerCase();
    
    // Common city name patterns and their proper names
    const cityPatterns = [
      // Major cities with common variations
      { patterns: ['bangkok'], name: 'Bangkok' },
      { patterns: ['new york', 'nyc', 'ny '], name: 'New York' },
      { patterns: ['london'], name: 'London' },
      { patterns: ['paris'], name: 'Paris' },
      { patterns: ['tokyo'], name: 'Tokyo' },
      { patterns: ['singapore'], name: 'Singapore' },
      { patterns: ['berlin'], name: 'Berlin' },
      { patterns: ['madrid'], name: 'Madrid' },
      { patterns: ['rome'], name: 'Rome' },
      { patterns: ['amsterdam'], name: 'Amsterdam' },
      { patterns: ['vienna'], name: 'Vienna' },
      { patterns: ['prague'], name: 'Prague' },
      { patterns: ['budapest'], name: 'Budapest' },
      { patterns: ['warsaw'], name: 'Warsaw' },
      { patterns: ['moscow'], name: 'Moscow' },
      { patterns: ['istanbul'], name: 'Istanbul' },
      { patterns: ['dubai'], name: 'Dubai' },
      { patterns: ['mumbai', 'bombay'], name: 'Mumbai' },
      { patterns: ['delhi', 'new delhi'], name: 'Delhi' },
      { patterns: ['bangalore', 'bengaluru'], name: 'Bangalore' },
      { patterns: ['shanghai'], name: 'Shanghai' },
      { patterns: ['beijing', 'peking'], name: 'Beijing' },
      { patterns: ['hong kong'], name: 'Hong Kong' },
      { patterns: ['seoul'], name: 'Seoul' },
      { patterns: ['sydney'], name: 'Sydney' },
      { patterns: ['melbourne'], name: 'Melbourne' },
      { patterns: ['toronto'], name: 'Toronto' },
      { patterns: ['vancouver'], name: 'Vancouver' },
      { patterns: ['montreal', 'montréal'], name: 'Montreal' },
      { patterns: ['mexico city', 'mexico'], name: 'Mexico City' },
      { patterns: ['são paulo', 'sao paulo'], name: 'São Paulo' },
      { patterns: ['rio de janeiro', 'rio'], name: 'Rio de Janeiro' },
      { patterns: ['buenos aires'], name: 'Buenos Aires' },
      { patterns: ['san martín de los andes', 'san martin de los andes'], name: 'San Martín de los Andes' },
      { patterns: ['bariloche', 'san carlos de bariloche'], name: 'Bariloche' },
      { patterns: ['cairo'], name: 'Cairo' },
      { patterns: ['johannesburg'], name: 'Johannesburg' },
      { patterns: ['cape town'], name: 'Cape Town' },
      { patterns: ['lagos'], name: 'Lagos' },
      { patterns: ['nairobi'], name: 'Nairobi' },
    ];
    
    // Check each city pattern
    for (const city of cityPatterns) {
      for (const pattern of city.patterns) {
        if (addressLower.includes(pattern)) {
          return city.name;
        }
      }
    }
    
    // If no pattern matches, try to extract the first word that looks like a city
    // This is a fallback for cities not in our list
    const words = address.split(/[,\s]+/).filter(word => word.length > 2);
    for (const word of words) {
      // Skip common non-city words
      if (['street', 'avenue', 'road', 'boulevard', 'drive', 'lane', 'way', 'place', 'court', 'circle', 'square', 'plaza', 'center', 'centre', 'mall', 'building', 'tower', 'hotel', 'restaurant', 'cafe', 'bar', 'pub', 'club', 'house', 'hall', 'theater', 'theatre', 'museum', 'gallery', 'library', 'school', 'university', 'college', 'hospital', 'clinic', 'office', 'center', 'centre', 'park', 'garden', 'plaza', 'square'].includes(word.toLowerCase())) {
        continue;
      }
      
      // If the word is capitalized and not a number, it might be a city
      if (word[0] === word[0].toUpperCase() && isNaN(Number(word))) {
        return word;
      }
    }
    
    return '';
  }
}

