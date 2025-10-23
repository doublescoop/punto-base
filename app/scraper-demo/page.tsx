import { EventScraper } from '@/components/EventScraper';

export default function ScraperDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">SocialLayer Event Scraper Demo</h1>
          <p className="text-muted-foreground text-lg">
            This tool extracts structured data from SocialLayer event pages to help generate 
            post-event zine content suggestions. Perfect for continuing meaningful discussions 
            and sharing memorable moments from events.
          </p>
        </div>
        
        <EventScraper />
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Enter a SocialLayer event URL (like the example provided)</li>
            <li>The scraper extracts key event information including title, date, location, organizer, tags, and more</li>
            <li>Based on the extracted data, it generates content suggestions for a post-event zine</li>
            <li>Use these suggestions to create engaging content that continues the event&apos;s meaningful discussions</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
