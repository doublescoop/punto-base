export interface SocialLayerEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  timezone: string;
  location: {
    name: string;
    address: string;
    city: string;
    region: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  organization: {
    name: string;
    type: 'company' | 'team' | 'residency' | 'unknown';
  };
  hosts: Array<{
    name: string;
    role: 'host' | 'co-host';
    profileUrl?: string;
  }>;
  tags: string[];
  category: string;
  eventType: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  content: {
    description: string;
    media: string[];
    comments: number;
  };
  participants: Array<{
    name: string;
    profileUrl?: string;
    avatar?: string;
  }>;
  participantCount: {
    count: number;
    maxParticipants?: number;
  };
  url: string;
  scrapedAt: string;
}

export interface EventScrapeResult {
  success: boolean;
  data?: SocialLayerEvent;
  error?: string;
  metadata: {
    url: string;
    scrapedAt: string;
    processingTime: number;
  };
}

export interface EventScrapeRequest {
  url: string;
}
