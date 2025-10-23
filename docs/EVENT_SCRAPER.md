# SocialLayer Event Scraper

A Next.js + TypeScript web scraper that extracts structured data from SocialLayer event pages to generate post-event zine content suggestions.

## Features

- **Structured Data Extraction**: Extracts event title, date, location, organizer, tags, participants, and more
- **Content Suggestions**: Generates ideas for post-event zine content based on scraped data
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Error Handling**: Robust error handling and validation
- **Next.js Compatible**: Works seamlessly with Next.js API routes and React components

## Installation

The scraper uses the following dependencies (already installed):

```bash
npm install cheerio
```

## Usage

### Basic API Usage

```typescript
import { EventApi } from '@/lib/eventApi';

// Scrape an event
const result = await EventApi.scrapeEvent('https://app.sola.day/event/detail/16716');

if (result.success) {
  console.log('Event data:', result.data);
  const suggestions = EventApi.generateZineContentSuggestions(result);
  console.log('Content suggestions:', suggestions);
}
```

### React Component Usage

```tsx
import { EventScraper } from '@/components/EventScraper';

function MyPage() {
  return (
    <div>
      <EventScraper 
        onEventScraped={(event) => console.log('Event scraped:', event)}
        onContentSuggestions={(suggestions) => console.log('Suggestions:', suggestions)}
      />
    </div>
  );
}
```

### API Endpoints

#### POST `/api/scrape-event`

Scrape an event using POST method with JSON body.

**Request:**
```json
{
  "url": "https://app.sola.day/event/detail/16716"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "16716",
    "title": "Edge City Patagonia",
    "description": "meetup·d/acc Weekly Reading Circle",
    "date": "Tue, Nov 11, 2025",
    "time": "16:00 - 17:00",
    "timezone": "GMT-3",
    "location": {
      "name": "Del Sauco Apart & Spa",
      "address": "José Calderón 364, San Martín de los Andes, Neuquén, Argentina",
      "city": "San Martín de los Andes",
      "region": "Neuquén",
      "country": "Argentina"
    },
    "organizer": {
      "name": "d/acc Residency Host",
      "type": "individual"
    },
    "tags": ["Decentralized Technologies", "Governance", "D/ACC"],
    "category": "General",
    "eventType": "meetup",
    "status": "upcoming",
    "participants": {
      "count": 0
    },
    "content": {
      "media": [],
      "comments": 0
    },
    "url": "https://app.sola.day/event/detail/16716",
    "scrapedAt": "2024-01-15T10:30:00.000Z"
  },
  "metadata": {
    "url": "https://app.sola.day/event/detail/16716",
    "scrapedAt": "2024-01-15T10:30:00.000Z",
    "processingTime": 1250
  }
}
```

#### GET `/api/scrape-event?url=<event-url>`

Scrape an event using GET method with URL parameter.

**Example:**
```
GET /api/scrape-event?url=https://app.sola.day/event/detail/16716
```

## Data Structure

### SocialLayerEvent Interface

```typescript
interface SocialLayerEvent {
  id: string;                    // Event ID extracted from URL
  title: string;                 // Event title
  description: string;           // Event description
  date: string;                  // Event date
  time: string;                  // Event time range
  timezone: string;              // Timezone (e.g., "GMT-3")
  location: {
    name: string;                // Venue name
    address: string;             // Full address
    city: string;                // City
    region: string;              // State/Region
    country: string;             // Country
    coordinates?: {              // Optional coordinates
      lat: number;
      lng: number;
    };
  };
  organizer: {
    name: string;                // Organizer name
    type: string;                // Organizer type
  };
  tags: string[];                // Event tags
  category: string;              // Event category
  eventType: string;             // Type of event (meetup, conference, etc.)
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: {
    count: number;               // Number of participants
    maxParticipants?: number;    // Maximum participants (if available)
  };
  content: {
    media: string[];             // Media URLs
    comments: number;            // Number of comments
  };
  url: string;                   // Original event URL
  scrapedAt: string;             // ISO timestamp of scraping
}
```

## Content Suggestions

The scraper generates content suggestions for post-event zines including:

- Event recaps and highlights
- Topic discussions based on tags
- Community moments and connections
- Photo galleries and media sharing
- TIL (Today I Learned) sections
- Gratitude and appreciation
- Anonymous messages and feedback
- Poetry and creative expressions
- Resource sharing
- Future event ideas

## Demo

Visit `/scraper-demo` to see the scraper in action with a live demo interface.

## Error Handling

The scraper includes comprehensive error handling:

- URL validation
- Network error handling
- HTML parsing error handling
- Graceful fallbacks for missing data
- Detailed error messages

## Customization

You can extend the scraper by:

1. **Adding new data extraction methods** in `SocialLayerScraper`
2. **Customizing content suggestions** in `EventApi.generateZineContentSuggestions`
3. **Adding new event types** by extending the parsing logic
4. **Integrating with other services** using the structured data output

## Examples

See `/examples/event-scraper-usage.ts` for comprehensive usage examples including:

- Basic scraping
- React component integration
- Server-side usage
- Batch processing
- Custom content generation

## License

This scraper is part of the Punto project and follows the same license terms.
