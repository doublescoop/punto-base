"use client";

import { useState } from "react";

export function EventScraper() {
  const [eventUrl, setEventUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);

  const handleScrape = async () => {
    if (!eventUrl) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/scrape-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventUrl }),
      });
      const data = await response.json();
      setScrapedData(data);
    } catch (error) {
      console.error('Error scraping event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          SocialLayer Event URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://app.sociallayer.im/event/..."
            value={eventUrl}
            onChange={(e) => setEventUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleScrape}
            disabled={!eventUrl || isLoading}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            {isLoading ? 'Scraping...' : 'Scrape Event'}
          </button>
        </div>
      </div>

      {scrapedData && (
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Scraped Event Data</h3>
          <pre className="text-sm bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(scrapedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}