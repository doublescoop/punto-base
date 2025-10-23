// Simple test script to demonstrate the event scraper
const testUrl = 'https://app.sola.day/event/detail/16716';

async function testScraper() {
  try {
    console.log('🔍 Testing SocialLayer Event Scraper...\n');
    
    // Test the API
    const response = await fetch(`http://localhost:3002/api/scrape-event?url=${encodeURIComponent(testUrl)}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Scraping successful!\n');
      console.log('📊 Extracted Data:');
      console.log(`   Title: ${result.data.title}`);
      console.log(`   Description: ${result.data.description}`);
      console.log(`   Event Type: ${result.data.eventType}`);
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Media Count: ${result.data.content.media.length}`);
      console.log(`   Processing Time: ${result.metadata.processingTime}ms\n`);
      
      // Generate content suggestions
      console.log('💡 Post-Event Zine Content Suggestions:');
      const suggestions = generateContentSuggestions(result.data);
      suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
      
    } else {
      console.log('❌ Scraping failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function generateContentSuggestions(eventData) {
  const suggestions = [];
  
  // Event-specific suggestions
  suggestions.push(`Event Recap: "${eventData.title}" - ${eventData.date || 'Date TBD'}`);
  
  if (eventData.description) {
    suggestions.push(`Deep Dive: ${eventData.description.substring(0, 100)}...`);
  }
  
  // Event type specific suggestions
  if (eventData.eventType === 'meetup') {
    suggestions.push('Community Moments: Share your favorite interaction with fellow participants');
    suggestions.push('Reading Circle Highlights: What insights did you gain from the discussion?');
  }
  
  // Generic zine content ideas
  suggestions.push(
    'Memorable Moments: What made you laugh, think, or feel inspired?',
    'TIL (Today I Learned): Key takeaways and insights',
    'Connections Made: New friends, collaborators, or mentors',
    'Anonymous Messages: Share thoughts without attribution',
    'Poetry Corner: Creative expressions inspired by the event',
    'Gratitude Section: Thank you notes to organizers and participants',
    'Resource Sharing: Tools, links, and resources mentioned',
    'Action Items: What are you going to do differently because of this event?',
    'Community Building: How can we stay connected?',
    'Event Evolution: Suggestions for future improvements'
  );
  
  return suggestions;
}

// Run the test
testScraper();
