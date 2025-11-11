# 🎨 Visual Architecture & Flow Diagrams

## 📊 Complete System Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            🌍 CLIENT BROWSER 🌍                             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  User: "I want friendly small dogs under 50 pounds good with kids"  │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │      SearchBar Component (SearchBarAdvanced.tsx)            │   │ │
│  │  │                                                              │   │ │
│  │  │  Input Field: [friendly small dogs under 50 pounds...]   │   │ │
│  │  │                                                              │   │ │
│  │  │  onInputChange() {                                         │   │ │
│  │  │    clearTimeout(debounceTimer)  // Clear old timer        │   │ │
│  │  │    debounceTimer = setTimeout(() => {                     │   │ │
│  │  │      fetch('/api/search?q=...')                           │   │ │
│  │  │    }, 500ms)                   // Wait 500ms              │   │ │
│  │  │  }                                                          │   │ │
│  │  │                                                              │   │ │
│  │  │  Results (if search executed):                             │   │ │
│  │  │  ┌─────────────────────────────────┐                      │   │ │
│  │  │  │ ⭐ Bichon Frise (95% match)   │                      │   │ │
│  │  │  │    Small, Friendly, <18 lbs   │                      │   │ │
│  │  │  ├─────────────────────────────────┤                      │   │ │
│  │  │  │ ⭐ Cavalier King Charles (85%)│                      │   │ │
│  │  │  │    Small, Friendly, <35 lbs    │                      │   │ │
│  │  │  ├─────────────────────────────────┤                      │   │ │
│  │  │  │ ⭐ Maltese (80% match)        │                      │   │ │
│  │  │  │    Small, Friendly, <7 lbs     │                      │   │ │
│  │  │  └─────────────────────────────────┘                      │   │ │
│  │  │                                                              │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │      Results Grid Component (ResultsGrid.tsx)              │   │ │
│  │  │                                                              │   │ │
│  │  │  Sort by: [Relevance ▼]                                   │   │ │
│  │  │                                                              │   │ │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │   │ │
│  │  │  │ Bichon     │  │ Cavalier   │  │ Maltese    │          │   │ │
│  │  │  │ Frise      │  │ King       │  │            │          │   │ │
│  │  │  │ ⭐95%      │  │ Charles    │  │ ⭐80%      │          │   │ │
│  │  │  │ [Image]    │  │ ⭐85%      │  │ [Image]    │          │   │ │
│  │  │  │ Small      │  │ [Image]    │  │ Small      │          │   │ │
│  │  │  │ Friendly   │  │ Small      │  │ Friendly   │          │   │ │
│  │  │  │            │  │ Friendly   │  │            │          │   │ │
│  │  │  └────────────┘  └────────────┘  └────────────┘          │   │ │
│  │  │                                                              │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                HTTP GET Request    │    /api/search?q=friendly small...
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                          🚀 BACKEND SERVER 🚀                               │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                  API Route Handler (route.ts)                         │ │
│  │                                                                        │ │
│  │  STEP 1: Validate Input ✓                                            │ │
│  │  ├─ query: "friendly small dogs under 50 pounds good with kids"    │ │
│  │  └─ limit: 8                                                         │ │
│  │                                                                        │ │
│  │  STEP 2: Check Cache 🔍                                             │ │
│  │  ├─ Key: search:friendly small dogs under 50 pounds good with kids │ │
│  │  └─ Result: CACHE MISS (not cached yet)                            │ │
│  │                                                                        │ │
│  │  STEP 3: Extract Traits 🧠                                          │ │
│  │  ├─ Input: "friendly small dogs under 50 pounds good with kids"   │ │
│  │  ├─ Method: Pattern matching + keyword extraction                 │ │
│  │  └─ Output:                                                         │ │
│  │     {                                                                │ │
│  │       sizes: ['small'],                                             │ │
│  │       temperaments: ['friendly', 'good with kids'],                │ │
│  │       maxWeight: 50,                                                │ │
│  │       keywordMatches: ['dogs']                                      │ │
│  │     }                                                                │ │
│  │                                                                        │ │
│  │  STEP 4: Fetch/Cache Breeds 📥                                      │ │
│  │  ├─ Check: all_breeds in cache?                                     │ │
│  │  ├─ YES → Use cached 200+ breeds                                    │ │
│  │  └─ NO → Call TheDogAPI, cache result                              │ │
│  │                                                                        │ │
│  │  STEP 5: Rank Breeds 📊                                             │ │
│  │  ├─ For each breed, calculate score:                               │ │
│  │  │                                                                   │ │
│  │  │  Bichon Frise:                                                   │ │
│  │  │  • Has "friendly" in temperament? YES (+10)                     │ │
│  │  │  • Has "small" in name/data? YES (+8)                           │ │
│  │  │  • Weight 12-18 lbs < 50 lbs? YES (+15)                         │ │
│  │  │  • Has "good with kids" mention? NO (+0)                        │ │
│  │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                          │ │
│  │  │  TOTAL SCORE: 33/40                                              │ │
│  │  │                                                                   │ │
│  │  │  Cavalier King Charles:                                          │ │
│  │  │  • Has "friendly" in temperament? YES (+10)                     │ │
│  │  │  • Has "small" in name/data? NO (+0)                            │ │
│  │  │  • Weight 24-30 lbs < 50 lbs? YES (+15)                         │ │
│  │  │  • Has "good with kids" mention? NO (+0)                        │ │
│  │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                          │ │
│  │  │  TOTAL SCORE: 25/40                                              │ │
│  │  │                                                                   │ │
│  │  │  Labrador:                                                       │ │
│  │  │  • Has "friendly" in temperament? YES (+10)                     │ │
│  │  │  • Has "small" in name/data? NO (+0)                            │ │
│  │  │  • Weight 55-80 lbs < 50 lbs? NO (+0)                           │ │
│  │  │  • Has "good with kids" mention? NO (+0)                        │ │
│  │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                          │ │
│  │  │  TOTAL SCORE: 10/40                                              │ │
│  │  │                                                                   │ │
│  │  └─ Sorted by score (descending): [Bichon, Cavalier, Labrador] │ │
│  │                                                                        │ │
│  │  STEP 6: Cache Results 💾                                           │ │
│  │  ├─ Key: search:friendly small dogs...                             │ │
│  │  ├─ Value: [Bichon(33), Cavalier(25), Labrador(10), ...]         │ │
│  │  └─ TTL: 30 minutes                                                │ │
│  │                                                                        │ │
│  │  STEP 7: Return Response 📤                                         │ │
│  │  └─ JSON with results + match scores                               │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    In-Memory Cache (cache.ts)                        │ │
│  │                                                                        │ │
│  │  Cache Entries:                                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ Key: "all_breeds"                                          │   │ │
│  │  │ Value: [Affenpinscher, Afghan Hound, ... 200+ breeds]    │   │ │
│  │  │ TTL: 30 minutes                                            │   │ │
│  │  │ Expires: 2025-11-11 14:35:00                              │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ Key: "search:friendly small dogs..."                       │   │ │
│  │  │ Value: [{Bichon:33}, {Cavalier:25}, {Labrador:10}]        │   │ │
│  │  │ TTL: 30 minutes                                            │   │ │
│  │  │ Expires: 2025-11-11 14:35:30                              │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                         📡 EXTERNAL API 📡                                  │
│                                                                              │
│  GET https://api.thedogapi.com/v1/breeds                                   │
│                                                                              │
│  Headers:                                                                   │
│  • x-api-key: ${NEXT_PUBLIC_DOG_API_KEY}                                   │
│                                                                              │
│  Response (200+ dog breeds with images and metadata)                       │
│                                                                              │
│  Only called if:                                                           │
│  • All breeds NOT in cache                                                │
│  • OR cache expired (30 min)                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow

```
TIME: 0ms
┌─────────────────────────┐
│ User types: "friendly"  │
│ in search box           │
└──────────────┬──────────┘
               │ onChange event triggered

TIME: 50ms
┌─────────────────────────┐
│ User continues typing:  │
│ "friendly s"            │
└──────────────┬──────────┘
               │ Previous timer cleared
               │ New timer started
               │ (will fire at 550ms)

TIME: 100ms
┌─────────────────────────┐
│ User continues typing:  │
│ "friendly sm"           │
└──────────────┬──────────┘
               │ Timer cleared again
               │ New timer started
               │ (will fire at 600ms)

TIME: 450ms
┌─────────────────────────┐
│ User finishes typing:   │
│ "friendly small dogs"   │
└──────────────┬──────────┘
               │ No more keystrokes
               │ Timer counting down...

TIME: 550ms (DEBOUNCE FIRES)
┌──────────────────────────────────────┐
│ Debounce timer triggers              │
│ → API call to /api/search            │
└──────────────────┬───────────────────┘
                   │ HTTP GET request

TIME: 560ms
┌──────────────────────────────────────┐
│ Backend receives request             │
│ • Parses query: "friendly small dogs"│
│ • Checks cache (MISS)                │
│ • Extracts traits                    │
└──────────────────┬───────────────────┘
                   │

TIME: 570ms
┌──────────────────────────────────────┐
│ Backend checks breed cache           │
│ • ALL_BREEDS in cache? YES (hit!)    │
│ • Use cached 200+ breeds             │
└──────────────────┬───────────────────┘
                   │

TIME: 580ms
┌──────────────────────────────────────┐
│ Backend ranks breeds                 │
│ • Calculate score for each breed     │
│ • Sort by score (descending)         │
│ • Filter & limit to top 8            │
└──────────────────┬───────────────────┘
                   │

TIME: 590ms
┌──────────────────────────────────────┐
│ Cache search results                 │
│ Key: "search:friendly small dogs"    │
└──────────────────┬───────────────────┘
                   │

TIME: 600ms
┌──────────────────────────────────────┐
│ Response sent to frontend            │
│ • Status: 200 OK                     │
│ • Body: { results: [...], ... }      │
└──────────────────┬───────────────────┘
                   │

TIME: 610ms
┌──────────────────────────────────────┐
│ Frontend receives response           │
│ • Parse results                      │
│ • Update component state             │
│ • Trigger re-render                  │
└──────────────────┬───────────────────┘
                   │

TIME: 620ms
┌──────────────────────────────────────┐
│ Browser renders results              │
│ • Show dropdown with matches         │
│ • Display match score badges         │
│ • Show breed images                  │
└──────────────────────────────────────┘

TOTAL TIME: 120ms from debounce to render ✨
```

---

## 🧮 Trait Extraction Process

```
Input Query:
"I'm looking for a friendly small dog under 50 pounds good with kids"

↓

Word Tokenization:
["i'm", "looking", "for", "a", "friendly", "small", "dog", 
 "under", "50", "pounds", "good", "with", "kids"]

↓

Keyword Matching:

SIZE KEYWORDS:
├─ small → FOUND ✓ (in sizes.small list)
├─ medium → NOT found
└─ large → NOT found

TEMPERAMENT KEYWORDS:
├─ friendly → FOUND ✓ (in temperaments.friendly list)
├─ good with kids → FOUND ✓ (keyword match)
├─ energetic → NOT found
└─ calm → NOT found

WEIGHT REGEX:
├─ Pattern: /(?:under|less than|below|max|<)\s*(\d+)\s*(?:pound|lb|lbs)/
├─ Match: "under 50 pounds" ✓
└─ Extracted: maxWeight = 50

KEYWORD MATCHES:
├─ Filter words > 3 chars (remove noise)
├─ Remove common words (good, with, dogs, etc)
└─ Result: ["looking"]

↓

Final Extracted Traits:
{
  sizes: ["small"],
  temperaments: ["friendly", "good_with_kids"],
  maxWeight: 50,
  keywordMatches: ["looking"]
}

↓

Ready for Ranking Algorithm
```

---

## ⚙️ Scoring Algorithm Detail

```
For each breed in database:

┌─────────────────────────────────────────────────────────┐
│ BICHON FRISE                                            │
│ temperament: "Cheerful, Playful, Friendly, Affectionate"│
│ weight: { imperial: "12 - 18" }                        │
│ name: "Bichon Frise"                                    │
└──────────┬──────────────────────────────────────────────┘

SCORING BREAKDOWN:

  1. Temperament Matching (+10 per match):
     ├─ Query: "friendly"
     ├─ Breed temperament includes "Friendly"?
     ├─ Result: YES → +10 points
     └─ Running total: 10

  2. Size Matching (+8 per match):
     ├─ Query sizes: ["small"]
     ├─ Breed name "Bichon Frise" includes "small"?
     ├─ Breed temperament includes "small"?
     ├─ Result: NO → +0 points (but matches small by weight)
     └─ Running total: 10

  3. Weight Constraint (+15 if met):
     ├─ Query: maxWeight = 50 lbs
     ├─ Breed weight: 12-18 lbs
     ├─ Max breed weight: 18 < 50?
     ├─ Result: YES → +15 points
     └─ Running total: 25

  4. Breed Name Match (+5):
     ├─ Query keywords: ["looking"]
     ├─ Breed name contains "looking"?
     ├─ Result: NO → +0 points
     └─ Running total: 25

  5. Keyword Match (+3 per match):
     ├─ Query: "good with kids"
     ├─ Breed temperament includes "good with kids"?
     ├─ Result: NO direct mention → +0 points
     └─ FINAL TOTAL: 25 points

┌─────────────────────────────────────────────────────────┐
│ MATCH SCORE: 25/100 (normalized)                       │
│ Percentage: 25%                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Cache Hit/Miss Scenarios

```
REQUEST 1 (Time: 10:00:00)
├─ Query: "friendly small"
├─ Cache check: "search:friendly small"
├─ Result: MISS (not cached)
├─ Action: Fetch all breeds, rank, cache results
└─ Response time: 150ms

REQUEST 2 (Time: 10:00:30) - SAME USER
├─ Query: "friendly small"
├─ Cache check: "search:friendly small"
├─ Result: HIT! (found in cache)
├─ Action: Return cached results immediately
└─ Response time: 5ms ⚡ (30x faster!)

REQUEST 3 (Time: 10:15:00) - DIFFERENT USER
├─ Query: "friendly small"
├─ Cache check: "search:friendly small"
├─ Result: HIT! (still in cache, TTL not expired)
├─ Action: Return cached results
└─ Response time: 5ms ⚡

REQUEST 4 (Time: 10:35:00) - SAME QUERY AFTER 35 MIN
├─ Query: "friendly small"
├─ Cache check: "search:friendly small"
├─ Result: MISS (cache expired after 30 min)
├─ Action: Re-fetch from API, cache new results
└─ Response time: 150ms

CACHE EFFICIENCY SUMMARY:
├─ Total requests: 4
├─ Cache hits: 2
├─ Cache hit rate: 50%
├─ Average response time: (150+5+5+150)/4 = 77.5ms
└─ Without cache: (150+150+150+150)/4 = 150ms
   SAVINGS: 48% faster with caching!
```

---

## 📈 Performance Timeline

```
User Opens App (localhost:3000)
│
├─ Loads HTML/CSS/JS bundle        ≈ 50ms
├─ React hydration                 ≈ 30ms
└─ Page interactive               ≈ 80ms total

User Types in Search Bar
│
├─ Keystroke 1 ('f')
│  ├─ Debounce started (500ms timer)
│  └─ UI updated instantly
│
├─ Keystroke 2 ('r')
│  ├─ Timer cleared, new timer started
│  └─ UI updated instantly
│
├─ Keystroke 3 ('i')
│  ├─ Timer cleared, new timer started
│  └─ UI updated instantly
│
├─ Keystroke 4 ('e')
│  ├─ Timer cleared, new timer started
│  └─ UI updated instantly
│
├─ Keystroke 5 ('n')
│  ├─ Timer cleared, new timer started
│  └─ UI updated instantly
│
├─ Keystroke 6 ('d')
│  ├─ Timer cleared, new timer started
│  └─ UI updated instantly
│
├─ Keystroke 7 ('l')
│  ├─ Timer cleared, new timer started
│  └─ UI updated instantly
│
├─ Keystroke 8 ('y')
│  ├─ Timer cleared, new timer started
│  └─ UI updated instantly
│
└─ User stops typing (query = "friendly")
   │
   └─ 500ms debounce timer fires
      │
      ├─ API call: /api/search?q=friendly   ≈ 0ms (sending)
      │
      ├─ Backend processing               ≈ 100ms
      │  ├─ Parse request
      │  ├─ Check cache
      │  ├─ Extract traits
      │  ├─ Fetch/cache breeds
      │  ├─ Rank results
      │  └─ Serialize response
      │
      ├─ Response travel time              ≈ 10ms
      │
      ├─ Frontend receives response         ≈ 5ms
      │
      ├─ React state update                ≈ 5ms
      │
      ├─ Component re-render               ≈ 30ms
      │
      └─ UI shows results                  ≈ 150ms total

TOTAL TIME: 150ms from user finishing typing to seeing results ✨
WITHOUT DEBOUNCE: Would be 8 × 150ms = 1200ms total (worst case)
SAVINGS: 87.5% fewer API calls with debouncing!
```

---

**End of Visual Diagrams**
