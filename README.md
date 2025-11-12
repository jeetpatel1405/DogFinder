# 🐕 DogFinder

An interactive Next.js 14 web application that helps users discover and explore dog breeds with advanced filtering capabilities.

## ✨ Features

- **🔍 Smart Search**: Natural language search with 500ms debouncing
- **🎛️ Advanced Filters**: Filter by temperament, lifespan, height, and weight
- **⚡ Real-time Results**: Instant filtering with strict AND logic
- **❤️ Favorites**: Save and manage your favorite breeds
- **📱 Responsive Design**: Works seamlessly on all devices
- **🎯 Intelligent Scoring**: Results ranked by relevance

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: TheDogAPI integration
- **State Management**: React hooks
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TheDogAPI key (get from [thedogapi.com](https://thedogapi.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeetpatel1405/DogFinder.git
   cd DogFinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_DOG_API_KEY=your_api_key_here" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎯 How It Works

### Search & Filtering
- **Text Search**: Type naturally like "friendly small dogs"
- **Advanced Filters**: Use dropdowns for precise filtering
  - **Nature**: Select multiple temperaments (Friendly, Calm, etc.)
  - **Lifespan**: Choose age ranges (10-12 years, 12-14 years, etc.)
  - **Height**: Select height ranges (< 10 in, 10-15 in, etc.)
  - **Weight**: Pick weight categories (< 20 lbs, 20-40 lbs, etc.)

### Filtering Logic
- **Strict AND**: Breeds must meet ALL selected criteria
- **Range Matching**: Physical traits must fall within filter bounds
- **Temperament Matching**: Must have ALL selected temperaments
- **Smart Scoring**: Results ranked by relevance (0-100 score)

## 📁 Project Structure

```
DogFinder/
├── app/
│   ├── api/search/route.ts      # Search API endpoint
│   ├── components/
│   │   ├── AdvancedFilterBar.tsx # 4-filter dropdown system
│   │   ├── SearchBar.tsx         # Text search with debouncing
│   │   ├── BreedCard.tsx         # Individual breed display
│   │   └── NavBar.tsx            # Navigation component
│   ├── favorites/page.tsx        # Saved breeds page
│   ├── breeds/[id]/page.tsx      # Individual breed details
│   └── page.tsx                  # Main home page
├── lib/
│   └── traitExtractor.ts         # Filtering & scoring logic
└── public/                       # Static assets
```

## 🔧 Key Components

### AdvancedFilterBar
- 4 filter types with dropdown UI
- Builds natural language queries
- Smart conflict resolution

### SearchBar  
- 500ms debounce for optimal UX
- Real-time search suggestions
- Auto-search on filter application

### Trait Extraction Engine
- Converts natural language to structured data
- Regex patterns for precise parsing
- Handles complex filter combinations

## 🎨 UI States

- **Initial State**: Shows all breeds in category grid
- **Search Results**: Filtered breeds with match scores
- **No Results**: Helpful message with filter adjustment tips
- **Loading State**: Smooth transitions during API calls

## 🔗 API Integration

- **External API**: TheDogAPI for breed data
- **Fresh Data**: No caching - always current information
- **Response Time**: ~150ms average
- **Data Fields**: Temperament, weight, height, lifespan, images

## 🧪 Example Queries

```
"friendly calm dogs"                    → Temperament filtering
"lifespan 10-12"                       → Age range filtering  
"at least 20 lbs at most 40 lbs"      → Weight range filtering
"height 15-20 inches"                  → Height filtering
"friendly calm lifespan 10-12 weight 25-50" → Combined filters
```

## 🏗️ System Architecture

![System Architecture](./System_Diagram.jpg)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TheDogAPI](https://thedogapi.com) for comprehensive breed data
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for beautiful styling

---

**Built by [Jeet Patel](https://github.com/jeetpatel1405)**