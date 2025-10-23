# SocialLayer Event Data Mapping

## Key Data Points Found in HTML

Based on analysis of https://app.sola.day/event/detail/16716, here are the exact patterns to extract:

### 1. **Title** ✅ WORKING
- **Pattern**: `"og:title"[^>]*content="([^"]*)"`
- **Example**: `"d/acc Weekly Reading Circle | Social Layer"`
- **Fallback**: `<title[^>]*>(.*?)</title>`

### 2. **Description** ✅ WORKING  
- **Pattern**: `"og:description"[^>]*content="([^"]*)"`
- **Example**: `"Join us for a relaxed weekly open discussion space to read and think together about key ideas shaping d/acc.\n\nBring a short summary of what you read to share - along with your thoughts, questions, and"`
- **Fallback**: `<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>`

### 3. **Date** ❌ NEEDS FIX
- **Pattern**: `"children":"(Tue, Nov \d+, \d+)"`
- **Example**: `"Tue, Nov 11, 2025"`
- **Location**: In the calendar section

### 4. **Time & Timezone** ❌ NEEDS FIX
- **Pattern**: `"children":"(\d+:\d+ - \d+:\d+ GMT-\d+)"`
- **Example**: `"16:00 - 17:00 GMT-3"`
- **Location**: Below the date

### 5. **Location Name** ❌ NEEDS FIX
- **Pattern**: `"children":"(Del Sauco Apart[^"]*)"`
- **Example**: `"Del Sauco Apart & Spa"`
- **Location**: In the location section

### 6. **Location Address** ❌ NEEDS FIX
- **Pattern**: `"children":"(José Calderón[^"]*)"`
- **Example**: `"José Calderón 364, San Martín de los Andes, Neuquén, Argentina"`
- **Location**: Below location name

### 7. **Organizer** ❌ NEEDS FIX
- **Pattern**: `"children":"(d/acc Residency[^"]*)"`
- **Example**: `"d/acc Residency "`
- **Location**: In the host section

### 8. **Tags** ❌ NEEDS FIX
- **Patterns**: 
  - `"children":"Decentralized Technologies"`
  - `"children":"Governance"`
  - `"children":"D/ACC"`
- **Location**: In the tags section

### 9. **Event Type** ✅ WORKING (hardcoded)
- **Pattern**: `"children":"meetup"`
- **Example**: `"meetup"`
- **Location**: In the title section

### 10. **Status** ✅ WORKING (hardcoded)
- **Pattern**: `"children":"Upcoming"`
- **Example**: `"Upcoming"`
- **Location**: In the status badge

### 11. **Event ID** ✅ WORKING
- **Pattern**: URL `/event/detail/(\d+)`
- **Example**: `"16716"`

### 12. **Cover Image** ✅ WORKING (from meta)
- **Pattern**: `"og:image"[^>]*content="([^"]*)"`
- **Example**: `"https://datastore.sola.day/85dc0a758856e46f"`

### 13. **Full Description (Markdown)** ❌ NEEDS FIX
- **Pattern**: `"markdownStr":"([^"]*)"}`
- **Example**: Full markdown content with reading materials
- **Location**: In the content section

## HTML Structure Notes

The page uses Next.js with server-side rendering, so the data is embedded in the HTML as:
1. **Meta tags** for basic info (title, description, image)
2. **JavaScript data** in script tags for dynamic content
3. **Visible HTML** for date, time, location, organizer, tags

## Current Status
- ✅ Title, Description, Event ID working
- ❌ Date, Time, Location, Organizer, Tags need regex fixes
- ❌ Full markdown description not extracted
- ✅ Basic structure working
