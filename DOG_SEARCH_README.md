# 🐕 DogFinder - Full-Stack Dog Search Solution

A sophisticated, full-stack web application for intelligent dog breed discovery using natural language processing, TheDogAPI integration, and advanced caching strategies.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Performance Features](#performance-features)

---

## ✨ Features

### 🔍 **Smart Natural Language Search**
- Enter queries like: "friendly small dogs under 50 pounds good with kids"
- Backend extracts key traits:
  - **Size**: small, medium, large
  - **Temperament**: friendly, energetic, calm, intelligent, protective
  - **Weight constraints**: "under 50 lbs", "less than 30 kg"
  - **Personality traits**: good with kids, good with cats, etc.

### 📊 **Intelligent Ranking**
- Results ranked by number of matching attributes
- Match score percentage displayed on each result
- Multi-criteria matching (temperament, size, weight, name)

### ⚡ **Performance Optimizations**
- **Debounced Search**: 500ms debounce prevents excessive API calls
- **In-Memory Caching**: Breeds data and search results cached for 30 minutes
- **Server-Side Processing**: Heavy lifting done on backend for faster results

### 🎨 **Rich UI/UX**
- Real-time search suggestions with loading states
- Breed cards with images, weight, lifespan, temperament
- Match score indicators and visual feedback
- Error handling and "no results" messaging
- Responsive design (mobile-first)

### 💾 **Data Augmentation**
- Local JSON database with:
  - Estimated breed pricing
  - Maintenance level (low, medium, high)
  - Detailed maintenance descriptions
- Extensible for additional breed metadata

---

## 🧱 Tech Stack

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Next.js 16 (API Routes)
- **Language**: TypeScript
- **HTTP Client**: Axios

### **Frontend**
- **Framework**: React 19 (with Next.js)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Animations**: Framer Motion

### **External APIs**
- **[TheDogAPI](https://www.thedogapi.com/)**: Breed data and images

### **Caching**
- **Strategy**: In-memory LRU cache (Node.js)
- **TTL**: 30 minutes for breeds data, configurable per cache entry
- **Singleton Pattern**: Global cache instance

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SearchBar (SearchBarAdvanced.tsx)                     │ │
│  │  - Debounced input (500ms)                             │ │
│  │  - Real-time suggestions dropdown                      │ │
│  │  - Match score indicators                              │ │
│  └─────────────────────┬──────────────────────────────────┘ │
└────────────────────────┼──────────────────────────────────────┘
                         │ HTTP GET /api/search?q=query
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Backend Server                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Route: /api/search/route.ts                       │ │
│  │  - Parse natural language query                        │ │
│  │  - Extract traits (size, temperament, weight)          │ │
│  │  - Check cache (CACHE_KEYS strategy)                   │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                         │
│  ┌──────────────────▼──────────────────┐                     │
│  │  Trait Extractor (traitExtractor.ts)│                     │
│  │  - Keyword matching                 │                     │
│  │  - Pattern recognition (weight)     │                     │
│  │  - Scoring algorithm                │                     │
│  └────────────────────────────────────┘                      │
│                     │                                         │
│  ┌──────────────────▼──────────────────┐                     │
│  │  Cache Layer (cache.ts)             │                     │
│  │  - SimpleCache class                │                     │
│  │  - 30min TTL                        │                     │
│  │  - Hit/Miss tracking                │                     │
│  └────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
          ┌──────────────────────────────┐
          │    TheDogAPI (/v1/breeds)    │
          │    - Fetch all breeds        │
          │    - Get breed images        │
          │    - Cache at server level   │
          └──────────────────────────────┘
                         │
                         ↓
        Results (ranked by match score)
```

### **Data Flow**

1. **User Input** → SearchBar with debounce
2. **Trait Extraction** → Extract: size, temperament, weight constraints
3. **Cache Check** → Return cached results if available
4. **TheDogAPI Call** → Fetch all breeds (cached server-side)
5. **Ranking** → Score breeds by matching attributes
6. **Response** → Send ranked results with match scores
7. **UI Update** → Display results with visual feedback

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn package manager
- API key from [TheDogAPI](https://www.thedogapi.com/)

### **Step 1: Clone & Install**

```bash
# Navigate to project directory
cd DogFinder

# Install dependencies
npm install
# or
yarn install
```

### **Step 2: Environment Configuration**

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_DOG_API_KEY=your_thedogapi_key_here
```

Get your free API key at: https://www.thedogapi.com/

### **Step 3: Run Development Server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### **Step 4: Build for Production**

```bash
npm run build
npm run start
```

---

## 💡 Usage

### **Search Examples**

Try these natural language queries:

| Query | Extracted Traits |
|-------|-----------------|
| "friendly small dogs" | size=small, temperament=friendly |
| "under 50 pounds, good with kids" | weight<50, temperament=friendly |
| "large energetic breed" | size=large, temperament=energetic |
| "calm intelligent companion" | temperament=calm,intelligent |
| "protective guard dog" | temperament=protective |

### **Using the Search Bar**

1. **Type naturally** - "I want a friendly dog under 30 pounds"
2. **Wait for debounce** - 500ms auto-search triggers
3. **See suggestions** - Results appear with match scores
4. **Click to explore** - Navigate to breed details page

### **Result Interpretation**

Each result card shows:
- ⭐ **Match Score %** - How many criteria it matches (0-100%)
- 🖼️ **Breed Image** - From TheDogAPI
- 📊 **Key Stats** - Weight, lifespan, temperament
- 💚 **Add to Favorites** - Save breeds you like

---

## 📡 API Documentation

### **GET /api/search**

Search for dog breeds using natural language queries.

**Parameters:**
- `q` (string, required): Natural language query
- `limit` (number, optional): Max results to return (default: 10)

**Request:**
```bash
curl "http://localhost:3000/api/search?q=friendly%20small%20dogs&limit=8"
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "query": "friendly small dogs",
  "extractedTraits": {
    "sizes": ["small"],
    "temperaments": ["friendly"],
    "maxWeight": null,
    "keywordMatches": ["dogs"]
  },
  "results": [
    {
      "id": 144,
      "name": "Bichon Frise",
      "weight": { "imperial": "12 - 18", "metric": "5 - 8" },
      "height": { "imperial": "9.5 - 11.5", "metric": "24 - 29" },
      "lifespan": "12 - 15 years",
      "temperament": "Cheerful, Sensitive, Playful, Affectionate, Friendly",
      "image": { "id": "ozEvzdVM", "url": "https://..." },
      "matchScore": 85
    },
    // ... more results
  ],
  "total": 24,
  "matchedBreeds": 24
}
```

**Error Response:**
```json
{
  "error": "Query parameter is required",
  "status": 400
}
```

---

## 📁 Project Structure

```
DogFinder/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts              # Main search API endpoint
│   ├── components/
│   │   ├── SearchBarAdvanced.tsx     # Enhanced search UI
│   │   ├── ResultsGrid.tsx           # Results display component
│   │   ├── BreedCard.tsx             # Individual breed card
│   │   ├── CategorySection.tsx       # Category grouping
│   │   ├── CategoryFilterBar.tsx     # Filter UI
│   │   ├── SearchBar.tsx             # Legacy search (kept)
│   │   └── NavBar.tsx                # Navigation
│   ├── breeds/
│   │   └── [id]/
│   │       └── page.tsx              # Breed detail page
│   ├── favorites/
│   │   └── page.tsx                  # Favorites page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
├── lib/
│   ├── traitExtractor.ts             # NLP trait extraction
│   ├── cache.ts                      # Caching layer
│   ├── dogAugmentation.json          # Breed metadata (price, maintenance)
│   └── dogData.json                  # Static breed data (optional)
├── public/
│   └── dog-placeholder.jpg           # Fallback image
├── .env.local                        # Environment variables (not committed)
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

---

## ⚡ Performance Features

### **1. Debounced Search**
```typescript
// 500ms debounce prevents API spam
debounceTimer.current = setTimeout(() => {
  performSearch(value);
}, 500);
```

### **2. In-Memory Cache**
```typescript
// Cache all breeds for 30 minutes
breedsCache.set(CACHE_KEYS.ALL_BREEDS, allBreeds);

// Check cache before API call
const cachedResults = breedsCache.get<any[]>(cacheKey);
```

### **3. Efficient Ranking Algorithm**
```typescript
// Score each breed (0-100+)
const score = matchTemperament + matchSize + matchWeight + keywordBonus;

// Sort by relevance and return top N results
const ranked = breeds.sort((a, b) => b.score - a.score);
```

### **4. Server-Side Processing**
- Trait extraction on backend
- Filtering before client response
- Reduces JavaScript bundle size

---

## 🎨 UI Components

### **SearchBarAdvanced**
- Real-time search with loading indicator
- Error message display
- Match score visualization
- Breed preview with images

### **ResultsGrid**
- Responsive grid layout
- Sort by relevance or name
- Match score badges
- Error/empty state handling

### **BreedCard**
- Breed image display
- Name and basic info
- Favorite button integration
- Link to detail page

---

## 🔧 Configuration & Customization

### **Adjust Debounce Time**
```typescript
// In SearchBarAdvanced.tsx
debounceTimer.current = setTimeout(() => {
  performSearch(value);
}, 300); // Change from 500ms to 300ms
```

### **Extend Trait Keywords**
```typescript
// In lib/traitExtractor.ts
const TRAIT_KEYWORDS = {
  temperaments: {
    playful: ['playful', 'silly', 'funny'],  // Add new traits
    // ...
  },
};
```

### **Modify Cache TTL**
```typescript
// In lib/cache.ts
private readonly DEFAULT_TTL = 60 * 60 * 1000; // Change to 1 hour
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API key not working | Check `.env.local` has correct key from TheDogAPI |
| No results found | Try simpler queries like "small" or "friendly" |
| Images not loading | Verify TheDogAPI is accessible (no rate limit) |
| Slow performance | Clear cache or restart dev server |

---

## 📊 Example Queries to Try

```
1. "friendly small dogs good with kids"
2. "large protective breed under 100 pounds"
3. "calm intelligent companion"
4. "energetic athletic runner"
5. "good with cats and kids"
6. "independent stubborn small"
7. "giant breed protective"
8. "playful toy dog"
```

---

## 🚀 Future Enhancements

- [ ] Advanced filters (price range, maintenance level)
- [ ] User authentication & personalized recommendations
- [ ] Breed comparison tool
- [ ] Mobile app version
- [ ] Machine learning recommendations based on user behavior
- [ ] GraphQL API alternative
- [ ] Elasticsearch for large-scale search
- [ ] Breed quiz feature
- [ ] Integration with adoption platforms
- [ ] Real-time breed availability

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Review API documentation at https://www.thedogapi.com/
3. Open a new issue with detailed information

---

## 🙏 Credits

- **TheDogAPI**: For providing comprehensive breed data and images
- **Next.js**: For the excellent React framework
- **Tailwind CSS**: For utility-first styling
- **Lucide React**: For beautiful icons

---

**Happy breed hunting! 🐕**
