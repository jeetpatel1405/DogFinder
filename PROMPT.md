# 🐶 Dog Search Solution - Complete Implementation Prompt

## 📋 Project Overview

You are building an advanced **Dog Search Solution** that uses natural language processing to help users find their perfect canine companion. The system accepts user queries in natural language and intelligently matches them against the TheDogAPI database.

---

## 🎯 Core Requirements

### 1. **Natural Language Query Processing**
- **Input**: User enters conversational queries like:
  - "I want a friendly small dog that's good with kids"
  - "Large energetic breeds under 100 pounds"
  - "Calm apartment-friendly dogs"
  - "Playful dogs good with cats"
  
- **Processing**: Extract key traits from query:
  - **Size**: small, medium, large
  - **Temperament**: friendly, calm, energetic, playful, protective, loyal
  - **Weight Range**: parse numbers and thresholds
  - **Special Traits**: good with kids, good with cats, apartment-friendly, intelligent
  
- **Output**: List of search constraints for filtering

### 2. **Backend Search Engine**
- **Location**: `app/api/search/route.ts` (Next.js API Route)
- **Functionality**:
  1. Accept natural language query from frontend
  2. Extract traits using regex/pattern matching
  3. Fetch all breeds from TheDogAPI
  4. Filter breeds by extracted traits
  5. Rank results by number of matching attributes
  6. Return top matches with relevance scores

### 3. **Frontend Search Interface**
- **SearchBar Component** (`app/components/SearchBar.tsx`):
  - Debounced input (300ms)
  - Real-time suggestions
  - Clear loading states
  - Error handling
  
- **ResultsGrid Component** (`app/components/ResultsGrid.tsx`):
  - Display breed cards with:
    - Dog image
    - Breed name & ID
    - Temperament
    - Weight range
    - Lifespan
    - Relevance score
    - Add to Favorites button
  - Pagination support
  - "No results" message
  - Error state

### 4. **Performance Optimization**
- **Caching Layer** (`lib/cache.ts`):
  - Cache breed data in memory for 1 hour
  - Cache search results
  - Clear cache on demand
  
- **Debouncing**:
  - Wait 300ms after user stops typing before API call
  - Prevent excessive requests

### 5. **Data Augmentation** (`data/dogAugmentation.json`)
- Add local data enrichment:
  ```json
  {
    "breed_id": {
      "estimated_price": "$1000-$2000",
      "maintenance_level": "high",
      "shedding": "medium",
      "training_difficulty": "easy"
    }
  }
  ```

---

## 🛠️ Technical Stack

```
Frontend:
├── Next.js 16 (React 19)
├── TypeScript
├── Tailwind CSS
├── Axios (HTTP client)
└── Debounce utilities

Backend:
├── Next.js API Routes
├── Node.js
├── In-memory caching
└── Regex-based NLP

External APIs:
└── TheDogAPI (https://api.thedogapi.com/v1/breeds)
```

---

## 📂 File Structure

```
DogFinder/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts              # Backend search logic
│   ├── components/
│   │   ├── SearchBar.tsx             # Enhanced search input
│   │   ├── ResultsGrid.tsx           # Display search results
│   │   ├── BreedCard.tsx             # (existing) Individual breed card
│   │   └── ...
│   ├── page.tsx                      # Main page
│   └── globals.css
│
├── lib/
│   ├── traitExtractor.ts             # NLP trait extraction
│   ├── cache.ts                      # Caching utility
│   └── types.ts                      # TypeScript types
│
├── data/
│   └── dogAugmentation.json          # Enriched dog data
│
├── PROMPT.md                         # This file
├── README.md                         # Setup & deployment
├── ARCHITECTURE.md                   # System design
└── package.json
```

---

## 🔧 Implementation Steps

### Step 1: Create Trait Extraction Utility (`lib/traitExtractor.ts`)

```typescript
export interface SearchTraits {
  sizes: string[];
  temperaments: string[];
  maxWeight?: number;
  specialTraits: string[];
}

export function extractTraits(query: string): SearchTraits {
  // Implementation details below
}
```

**Logic**:
- Convert query to lowercase
- Match size keywords: small, tiny, large, giant, medium
- Match temperament keywords: friendly, calm, energetic, loyal, protective, playful
- Match weight patterns: "under 50 pounds", "less than 30 lbs"
- Match special traits: "good with kids", "apartment", "intelligent", "lazy"

---

### Step 2: Create Caching Layer (`lib/cache.ts`)

```typescript
class BreedCache {
  private cache = new Map();
  private ttl = 3600000; // 1 hour
  
  set(key: string, value: any): void
  get(key: string): any | null
  clear(): void
  isExpired(key: string): boolean
}
```

---

### Step 3: Create Backend API (`app/api/search/route.ts`)

```typescript
export async function POST(req: Request) {
  // 1. Parse query from request body
  // 2. Extract traits using traitExtractor
  // 3. Check cache for breeds
  // 4. If not cached, fetch from TheDogAPI
  // 5. Filter breeds by traits
  // 6. Rank by matching attributes
  // 7. Return top 20 results with scores
}
```

**Algorithm**:
```
For each breed:
  score = 0
  if breed.weight matches maxWeight constraint: score += 2
  for each temperament in extracted temperaments:
    if temperament in breed.temperament: score += 1
  for each size in extracted sizes:
    if size matches breed category: score += 2
  
Return breeds sorted by score (descending)
```

---

### Step 4: Enhanced SearchBar Component

```typescript
"use client";
import { useCallback, useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Debounced search function (300ms delay)
  const handleSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      setError("");
      
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          body: JSON.stringify({ query: q })
        });
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        setError("Failed to search. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );
  
  return (
    // UI implementation
  );
}
```

---

### Step 5: ResultsGrid Component

```typescript
"use client";
export interface Breed {
  id: number;
  name: string;
  image: { url: string };
  weight: { min: number; max: number };
  height: { min: number; max: number };
  life_span: string;
  temperament: string;
  relevanceScore: number;
}

export default function ResultsGrid({
  breeds,
  loading,
  error,
  hasSearched
}: {
  breeds: Breed[];
  loading: boolean;
  error?: string;
  hasSearched: boolean;
}) {
  if (error) return <div className="error">{error}</div>;
  if (loading) return <div className="loading">Searching...</div>;
  if (hasSearched && breeds.length === 0) {
    return <div className="no-results">No breeds match your criteria</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {breeds.map(breed => (
        <BreedCard key={breed.id} breed={breed} showScore={true} />
      ))}
    </div>
  );
}
```

---

### Step 6: Data Augmentation File (`data/dogAugmentation.json`)

```json
{
  "1": {
    "estimated_price": "$600-$900",
    "maintenance_level": "high",
    "shedding": "high",
    "training_difficulty": "moderate",
    "good_for_apartments": false,
    "good_for_kids": true,
    "good_for_cats": false
  },
  "2": {
    "estimated_price": "$500-$800",
    "maintenance_level": "medium",
    "shedding": "medium",
    "training_difficulty": "easy",
    "good_for_apartments": true,
    "good_for_kids": true,
    "good_for_cats": true
  }
}
```

---

## 🎨 Example Queries & Expected Outputs

### Query 1: "I want a small friendly dog good with kids"
**Extracted Traits**:
- Sizes: ["small"]
- Temperaments: ["friendly"]
- Special Traits: ["good with kids"]

**Expected Results**:
1. Pug (Score: 5)
2. Cavalier King Charles Spaniel (Score: 5)
3. French Bulldog (Score: 4)

### Query 2: "Large energetic dog under 100 pounds"
**Extracted Traits**:
- Sizes: ["large"]
- Temperaments: ["energetic"]
- Max Weight: 100

**Expected Results**:
1. Labrador Retriever (Score: 6)
2. Golden Retriever (Score: 6)
3. Boxer (Score: 5)

### Query 3: "Calm lazy dog for apartment"
**Extracted Traits**:
- Temperaments: ["calm", "lazy"]
- Special Traits: ["apartment"]

**Expected Results**:
1. Bulldog (Score: 5)
2. Basset Hound (Score: 4)
3. Shih Tzu (Score: 4)

---

## 🔒 Error Handling

**Frontend Error States**:
- Network error: "Failed to search. Please try again."
- No results: "No breeds match your search criteria"
- Invalid query: "Please enter a valid search query"
- API error: "Service temporarily unavailable"

**Backend Error States**:
- Missing query: Return 400 with "Query is required"
- API failure: Return 503 with cached results or empty array
- Rate limiting: Implement exponential backoff

---

## ⚡ Performance Considerations

1. **Debouncing**: Wait 300ms after user stops typing
2. **Caching**: Store breed list for 1 hour
3. **Pagination**: Show 20 results per page
4. **Lazy Loading**: Load images on demand
5. **Compression**: Use gzip for API responses

---

## 🚀 Bonus Features

1. **Search Suggestions**: 
   - "friendly small dogs"
   - "large energetic dogs"
   - "calm apartment dogs"

2. **Recently Searched**:
   - Store last 5 searches in localStorage
   - Show dropdown on SearchBar focus

3. **Advanced Filters**:
   - Price range slider
   - Maintenance level selector
   - Add/remove from wishlist

4. **Share Results**:
   - Generate shareable URL with search params
   - Export results as PDF

5. **Mobile Optimization**:
   - Touch-friendly inputs
   - Swipeable results carousel

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SearchBar (User Input)                                 │
│         ↓                                               │
│  Debounce (300ms) → Trait Extraction (Client-side)     │
│         ↓                                               │
│  POST /api/search                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│            Backend (Next.js API Route)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Parse Query                                         │
│  2. Extract Traits (traitExtractor.ts)                 │
│  3. Check Cache                                         │
│  4. Fetch from TheDogAPI (if cache miss)               │
│  5. Filter & Rank by Traits                            │
│  6. Augment with local data                            │
│  7. Return top 20 results                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│          External APIs & Data Sources                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  • TheDogAPI /breeds endpoint                           │
│  • Local augmentation data (prices, traits)             │
│  • Cache layer (in-memory)                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│           Frontend Results Display                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ResultsGrid Component                                  │
│  ├─ Breed Card (Image, Name, Stats)                    │
│  ├─ Relevance Score                                    │
│  ├─ Add to Favorites                                   │
│  └─ Pagination                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Testing Checklist

- [ ] Trait extraction works for various query formats
- [ ] API returns results sorted by relevance score
- [ ] Caching works and expires after 1 hour
- [ ] Debouncing prevents excessive API calls
- [ ] Error handling shows appropriate messages
- [ ] Results display correctly with all breed info
- [ ] Favorites persistence works
- [ ] Mobile responsive design
- [ ] No console errors or warnings
- [ ] Load time under 2 seconds for typical queries

---

## 🎓 Learning Resources

- **NLP Basics**: Regex pattern matching, tokenization
- **Next.js API Routes**: [Next.js Docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Debouncing**: [JavaScript Patterns](https://github.com/lodash/lodash)
- **Caching Strategies**: LRU, TTL-based caching
- **TheDogAPI**: [API Documentation](https://api.thedogapi.com/v1/breeds)

---

## 🎯 Success Criteria

✅ Users can search using natural language
✅ Results are filtered and ranked intelligently
✅ Search is fast (under 500ms with caching)
✅ UI shows loading, error, and empty states
✅ Mobile responsive and accessible
✅ Code is well-documented and typed
✅ No console errors

---

## 📞 Support & Questions

When implementing, refer to:
- `ARCHITECTURE.md` for system design details
- `README.md` for setup instructions
- Individual component comments for specific logic
- TheDogAPI documentation for breed data structure

---

**Happy building! 🐕**
