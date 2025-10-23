'use client';

import React, { useState } from 'react';
import { EventApi } from '@/lib/eventApi';
import { EventScrapeResult, SocialLayerEvent } from '@/types/event';

interface EventScraperProps {
  onEventScraped?: (event: SocialLayerEvent) => void;
  onContentSuggestions?: (suggestions: string[]) => void;
}

export function EventScraper({ onEventScraped, onContentSuggestions }: EventScraperProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EventScrapeResult | null>(null);
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);

  const handleScrape = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);
    setContentSuggestions([]);

    try {
      const scrapeResult = await EventApi.scrapeEvent(url);
      setResult(scrapeResult);

      if (scrapeResult.success && scrapeResult.data) {
        onEventScraped?.(scrapeResult.data);
        
        const suggestions = EventApi.generateZineContentSuggestions(scrapeResult);
        setContentSuggestions(suggestions);
        onContentSuggestions?.(suggestions);
      }
    } catch (error) {
      console.error('Error scraping event:', error);
      setResult({
        success: false,
        error: 'Failed to scrape event',
        metadata: {
          url,
          scrapedAt: new Date().toISOString(),
          processingTime: 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleUrl = () => {
    setUrl('https://app.sola.day/event/detail/16716');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SocialLayer Event Scraper</CardTitle>
          <CardDescription>
            Extract event information from SocialLayer URLs to generate post-event zine content suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://app.sola.day/event/detail/16716"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleScrape} disabled={isLoading || !url.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Scrape Event'
              )}
            </Button>
            <Button onClick={handleExampleUrl}>
              Use Example
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? 'Event Data Extracted' : 'Scraping Failed'}
            </CardTitle>
            <CardDescription>
              {result.success 
                ? `Processed in ${result.metadata.processingTime}ms`
                : result.error
              }
            </CardDescription>
          </CardHeader>
          {result.success && result.data && (
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{result.data.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{result.data.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{result.data.date} at {result.data.time}</span>
                      {result.data.timezone && <Badge variant="secondary">{result.data.timezone}</Badge>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{result.data.location.name || result.data.location.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{result.data.participants.count} participants</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>{result.data.eventType} • {result.data.category}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Organizer:</span> {result.data.organizer.name}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge variant={result.data.status === 'upcoming' ? 'default' : 'secondary'} className="ml-2">
                        {result.data.status}
                      </Badge>
                    </div>
                    {result.data.tags.length > 0 && (
                      <div>
                        <span className="font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.data.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Media:</span> {result.data.content.media.length} images
                    </div>
                    <div>
                      <span className="font-medium">Comments:</span> {result.data.content.comments}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button asChild>
                  <a href={result.data.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Original Event
                  </a>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {contentSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Post-Event Zine Content Suggestions</CardTitle>
            <CardDescription>
              Ideas for creating meaningful post-event content based on the scraped event data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {contentSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                  {suggestion}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
