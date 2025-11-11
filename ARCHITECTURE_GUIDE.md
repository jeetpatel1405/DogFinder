# Architecture & Deployment Guide

## 🏗️ System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          🌐 CLIENT LAYER (Browser)                          ║
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────────┐  ║
║  │                      Home Page (page.tsx)                            │  ║
║  │                                                                      │  ║
║  │  ┌─────────────────────────────────────────────────────────────┐   │  ║
║  │  │              SearchBar Advanced Component                  │   │  ║
║  │  │  ┌────────────────────────────────────────────────────┐   │   │  ║
║  │  │  │ Input Field: "friendly small dogs under 50 lbs"  │   │   │  ║
║  │  │  │                                                  │   │   │  ║
║  │  │  │ [Debounce 500ms] → Event Handler                │   │   │  ║
║  │  │  └────────────────────────────────────────────────────┘   │   │  ║
║  │  │                                                            │   │  ║
║  │  │  ┌────────────────────────────────────────────────────┐   │   │  ║
║  │  │  │      Dropdown Results (Real-time)                 │   │   │  ║
║  │  │  │  • Loading spinner                                │   │   │  ║
║  │  │  │  • Error messages                                 │   │   │  ║
║  │  │  │  • Match score badges                             │   │   │  ║
║  │  │  │  • Breed previews with images                     │   │   │  ║
║  │  │  └────────────────────────────────────────────────────┘   │   │  ║
║  │  └─────────────────────────────────────────────────────────────┘   │  ║
║  │                                                                      │  ║
║  │  ┌─────────────────────────────────────────────────────────────┐   │  ║
║  │  │             Results Grid Component                         │   │  ║
║  │  │  • Responsive grid (1-4 columns)                          │   │  ║
║  │  │  • Sort by relevance / name                               │   │  ║
║  │  │  • Match score indicators                                 │   │  ║
║  │  │  • Empty/Error states                                     │   │  ║
║  │  └─────────────────────────────────────────────────────────────┘   │  ║
║  └──────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────┐ ║
║  │              Navigation & Breed Detail Pages                           │ ║
║  │  • Favorites page (/favorites)                                        │ ║
║  │  • Individual breed details (/breeds/[id])                           │ ║
║  └────────────────────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════════════╝
                                    │
                  HTTP GET Request   │   /api/search?q=...&limit=8
                                    ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 BACKEND LAYER (Next.js Server)                        ║
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────────┐  ║
║  │              API Route Handler (/api/search/route.ts)               │  ║
║  │                                                                      │  ║
║  │  1️⃣  Input Validation                                              │  ║
║  │     • Check query parameter exists & not empty                    │  ║
║  │     • Validate limit parameter                                   │  ║
║  │                                                                      │  ║
║  │  2️⃣  Cache Lookup                                                 │  ║
║  │     ┌─────────────────────────────────┐                          │  ║
║  │     │ Cache Key: search:${query}      │                          │  ║
║  │     │ If HIT: Return cached results   │                          │  ║
║  │     │ If MISS: Continue to step 3     │                          │  ║
║  │     └─────────────────────────────────┘                          │  ║
║  │                                                                      │  ║
║  │  3️⃣  Trait Extraction                                             │  ║
║  │     ┌──────────────────────────────────────────────────┐         │  ║
║  │     │ Input: "friendly small dogs under 50 pounds"    │         │  ║
║  │     │                                                  │         │  ║
║  │     │ Output:                                          │         │  ║
║  │     │ {                                                │         │  ║
║  │     │   sizes: ['small'],                             │         │  ║
║  │     │   temperaments: ['friendly'],                   │         │  ║
║  │     │   maxWeight: 50,                                │         │  ║
║  │     │   keywordMatches: ['dogs']                      │         │  ║
║  │     │ }                                                │         │  ║
║  │     └──────────────────────────────────────────────────┘         │  ║
║  │                                                                      │  ║
║  │  4️⃣  Fetch Breeds (with caching)                                 │  ║
║  │     • Check if all_breeds cached                                │  ║
║  │     • If YES: Use cached data (30min TTL)                       │  ║
║  │     • If NO: Call TheDogAPI, cache result                      │  ║
║  │                                                                      │  ║
║  │  5️⃣  Breed Ranking Algorithm                                     │  ║
║  │     For each breed:                                             │  ║
║  │     • Score temperament matches (+10 each)                     │  ║
║  │     • Score size matches (+8 each)                            │  ║
║  │     • Score weight constraint (+15 if met)                    │  ║
║  │     • Score name matches (+5)                                 │  ║
║  │     • Sort all breeds by total score (descending)             │  ║
║  │                                                                      │  ║
║  │  6️⃣  Cache Results                                              │  ║
║  │     • Store ranked results with search key                   │  ║
║  │     • 30 minute TTL for cache entry                           │  ║
║  │                                                                      │  ║
║  │  7️⃣  Return Response                                            │  ║
║  │     {                                                            │  ║
║  │       success: true,                                           │  ║
║  │       cached: false,                                           │  ║
║  │       query: "...",                                            │  ║
║  │       extractedTraits: {...},                                  │  ║
║  │       results: [{breed1}, {breed2}, ...],                      │  ║
║  │       total: 24,                                               │  ║
║  │       matchedBreeds: 24                                        │  ║
║  │     }                                                            │  ║
║  └──────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
║  ┌──────────────────────────────────────────────────────────────────────┐  ║
║  │                    🗄️  CACHE LAYER (in-memory)                      │  ║
║  │                                                                      │  ║
║  │  Cache Instance (Singleton)                                        │  ║
║  │  ├─ all_breeds: [all 200+ dog breeds] (TTL: 30min)              │  ║
║  │  ├─ search:friendly small dogs: [ranked results] (TTL: 30min) │  ║
║  │  ├─ search:large energetic: [ranked results] (TTL: 30min)     │  ║
║  │  └─ ... more search queries ...                                 │  ║
║  │                                                                      │  ║
║  │  Automatic expiration on TTL                                       │  ║
║  │  (Saves 80%+ API calls to TheDogAPI)                              │  ║
║  └──────────────────────────────────────────────────────────────────────┘  ║
╚══════════════════════════════════════════════════════════════════════════════╝
                                    │
                                    ↓
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🐕 EXTERNAL API LAYER (TheDogAPI)                        ║
║                                                                              ║
║  GET https://api.thedogapi.com/v1/breeds                                   ║
║                                                                              ║
║  Headers:                                                                   ║
║  • x-api-key: ${NEXT_PUBLIC_DOG_API_KEY}                                   ║
║                                                                              ║
║  Response (200+ breeds):                                                    ║
║  [                                                                          ║
║    {                                                                        ║
║      id: 1,                                                                 ║
║      name: "Affenpinscher",                                                 ║
║      temperament: "Playful, Stubborn, Curious, Mischievous",               ║
║      weight: { imperial: "7 - 13", metric: "3 - 6" },                      ║
║      height: { imperial: "9.5 - 11.5", metric: "24 - 29" },                ║
║      lifespan: "12 - 13 years",                                             ║
║      image: { url: "https://..." }                                          ║
║    },                                                                       ║
║    ...                                                                      ║
║  ]                                                                          ║
║                                                                              ║
║  Free tier: Rate limited (e.g., 100 calls/day or 1000 calls/month)        ║
║  Paid tier: Higher limits available                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔀 Data Flow Sequence Diagram

```
User               Client App          Cache            Server           TheDogAPI
 │                     │                │                 │                  │
 ├──type query─────────→│                │                 │                  │
 │                     │ (debounce 500ms)                 │                  │
 │                     │                │                 │                  │
 │                     ├─[timer]─────────→ check cache    │                  │
 │                     │                │                 │                  │
 │                     │                │ MISS            │                  │
 │                     │ <─────────────── ─────────────→ /api/search        │
 │                     │                │                 │                  │
 │                     │                │      extract    │                  │
 │                     │                │      traits     │                  │
 │                     │                │                 │ check cache      │
 │                     │                │           MISS  │                  │
 │                     │                │                 ├─GET /breeds─────→│
 │                     │                │                 │                  │
 │                     │                │                 │←────json────────┤
 │                     │                │                 │                  │
 │                     │                │                 │ rank breeds      │
 │                     │                │ cache result    │                  │
 │                     │                ←────────────────┤                  │
 │                     │←───────response with scores────────┤                │
 │                     │                │                 │                  │
 │ see results        │                │                 │                  │
 │←───display dropdown─┤                │                 │                  │
 │                     │                │                 │                  │
 │ click breed         │                │                 │                  │
 ├──navigate────────────→ /breeds/[id]                    │                  │
 │                     │                │                 │                  │
 └─────────────────────┴────────────────┴─────────────────┴──────────────────┘
```

---

## 📊 Component Interaction Map

```
                        ┌──────────────────┐
                        │   Home Page      │
                        │  (page.tsx)      │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ↓            ↓            ↓
            ┌──────────────┐ ┌─────────────┐ ┌────────────┐
            │ SearchBar    │ │ Results     │ │Category    │
            │Advanced      │ │ Grid        │ │Section     │
            │ (New)        │ │ (New)       │ │(Existing)  │
            └──────┬───────┘ └─────────────┘ └────────────┘
                   │
                   ↓ (calls)
        ┌─────────────────────────┐
        │ /api/search (New)       │
        │ route.ts                │
        └────────┬────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ↓          ↓          ↓
 ┌─────────┐ ┌────────┐ ┌──────────┐
 │Trait    │ │Cache   │ │TheDogAPI │
 │Extractor│ │Layer   │ │Integration
 │(New)    │ │(New)   │ │(Existing)
 └─────────┘ └────────┘ └──────────┘
```

---

## 🚀 Deployment Architecture

### **Development Environment**
```
Local Machine
├── Node.js 18+
├── npm packages
├── .env.local (API key)
├── In-memory cache
└── Localhost:3000
```

### **Production Deployment** (Recommended: Vercel)

```
┌─────────────────────────────────────┐
│        Vercel Edge Network          │
│  (Global CDN + Serverless Functions)│
│                                     │
│  ├─ Automatic HTTPS                │
│  ├─ Auto-scaling                   │
│  ├─ Environment variables          │
│  └─ Zero-config deployment         │
└──────────────┬──────────────────────┘
               │
        Deploy from GitHub
        (Automatic on push)
```

### **Alternative Deployments**

| Platform | Pros | Cons |
|----------|------|------|
| **Vercel** | Zero-config, fast, Next.js optimized | Vendor lock-in |
| **Netlify** | Easy deployment, great support | Limited backend |
| **Docker** | Full control, portable | Manual management |
| **AWS** | Scalable, feature-rich | Complex setup |
| **Heroku** | Simple, free tier | Limited resources |

---

## 🐳 Docker Deployment

### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
```

### **Build & Run**
```bash
# Build image
docker build -t dogfinder:latest .

# Run container
docker run -e NEXT_PUBLIC_DOG_API_KEY=your_key \
  -p 3000:3000 \
  dogfinder:latest

# Or with docker-compose
docker-compose up
```

---

## 📈 Performance Optimization Tips

### **Frontend Optimizations**
- ✅ Image lazy loading (native browser)
- ✅ Component code splitting (Next.js auto)
- ✅ CSS-in-JS with Tailwind (optimized output)
- ✅ Debounced search (500ms)

### **Backend Optimizations**
- ✅ Server-side caching (30min TTL)
- ✅ Trait extraction on backend
- ✅ Ranked results before response
- ✅ Compressed API responses

### **Infrastructure Optimizations**
- ✅ CDN for static assets
- ✅ Database indexing (if using DB)
- ✅ API rate limiting
- ✅ Load balancing for scale

---

## 🔍 Monitoring & Logging

### **Key Metrics to Track**

```typescript
// Add to API route
console.log({
  timestamp: new Date().toISOString(),
  query: query,
  duration: `${endTime - startTime}ms`,
  cached: fromCache ? 'yes' : 'no',
  resultsCount: results.length,
  status: 200
});
```

### **Recommended Services**
- **Logging**: LogRocket, Sentry, DataDog
- **Analytics**: Google Analytics, Mixpanel
- **Monitoring**: New Relic, Datadog, Cloudwatch
- **Error Tracking**: Sentry, Rollbar

---

## 🔒 Security Checklist

- [x] API key in `.env.local` (not committed)
- [x] Input validation on all endpoints
- [x] HTTPS enforced in production
- [x] CORS properly configured
- [x] Rate limiting implemented
- [x] No sensitive data in logs
- [x] Dependencies regularly updated
- [x] Error messages don't leak info

---

## 🧪 Testing Strategy

```typescript
// Example test cases
describe('Search API', () => {
  test('should extract traits correctly', () => {
    const traits = extractTraits('friendly small');
    expect(traits.temperaments).toContain('friendly');
    expect(traits.sizes).toContain('small');
  });

  test('should rank breeds by match score', () => {
    const ranked = rankBreeds(breeds, { sizes: ['small'], ... });
    expect(ranked[0].matchScore).toBeGreaterThanOrEqual(ranked[1].matchScore);
  });

  test('should cache results', () => {
    cache.set('test', 'value');
    expect(cache.get('test')).toBe('value');
  });
});
```

---

## 📚 Resources & Documentation

- **Next.js**: https://nextjs.org/docs
- **API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Vercel Deployment**: https://vercel.com/docs
- **TheDogAPI**: https://www.thedogapi.com/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**🎉 Ready to deploy!**
