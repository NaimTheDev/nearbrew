# ☕ NearBrew

**Find the perfect coffee shop based on real-time busyness data**

NearBrew is a full-stack web application that helps coffee lovers discover nearby cafes and check their live busyness levels before visiting. Built with a focus on performance optimization, intelligent caching strategies, and exceptional user experience. 

🔗 **[Live Demo](https://naimthedev.github.io/nearbrew/)** 

---

## 🎯 Key Features

### 📍 Location-Based Discovery
- **Radius-based search** with 30km (configurable) coverage area
- **Real-time geolocation** with HTML5 Geolocation API
- Interactive map visualization powered by Leaflet and OpenStreetMap
- Automatic user positioning with fallback handling

<img width="1020" height="1143" alt="SCR-20251130-qurx" src="https://github.com/user-attachments/assets/039e385a-5ba7-48e0-9d11-c62abe891a85" />

### 🔍 Smart Search
- **Google Places Autocomplete** integration for instant venue discovery
- On-demand live forecast queries that **bypass cache** for most accurate data
- Venue details including ratings, reviews, price level, and dwell time
- Opening hours with multi-timezone support

<img width="1030" height="719" alt="SCR-20251130-rbai" src="https://github.com/user-attachments/assets/ec9ec080-5bc0-464e-971e-2ccd3c82ab20" />


### ⚡ Live Busyness Intelligence
- **Real-time crowd data** from BestTime Radar API
- Live busyness percentages with intelligent thresholds (50-100% busy range)
- Historical trend analysis and predictive forecasting
- Peak hours and quiet window recommendations
- "Best time to meet" feature for planning coffee meetups

<img width="991" height="1098" alt="SCR-20251130-qwdb" src="https://github.com/user-attachments/assets/2d1d111c-6655-44c9-92b3-e4ef0bc1d61b" />



### 🎨 Polished User Experience
- Responsive design with mobile-first approach
- Custom coffee-themed UI with warm, inviting color palette
- Loading states, error boundaries, and graceful fallbacks
- Social sharing capabilities for meetup planning

---

## 🧠 Advanced Caching Architecture

BestTimeAPI has a limited number of api credits available for the free tier. To that end, I strove to follow the **ABC Rules of Caching** to save me some money 😎 but also prioritize performance in
a lightweight but robust manner

<img width="398" height="258" alt="Screenshot 2025-11-30 at 7 27 33 PM" src="https://github.com/user-attachments/assets/2d6c8d20-0010-460f-8b21-5828d51a8d2b" />


One of NearBrew's standout features is its **multi-layered caching strategy** that dramatically reduces API costs while maintaining data freshness.  The implementation follows the **ABC Rules of Caching**:

### 🏗️ Three-Tier Caching Strategy

#### 1️⃣ **Browser-Side Cache (React Query)**
```typescript
// Client-side cache: 5-minute stale time
staleTime: 5 * 60 * 1000  // 300 seconds
maximumAge: 300000        
```

**Purpose**: Eliminates redundant API calls during a user session
- Caches venue lists and user geolocation data
- Automatically serves cached data for repeated requests
- Logs cache hits/misses for debugging: `🟢 CACHE HIT` vs `🔴 CACHE MISS`

#### 2️⃣ **Server-Side Geographic Cache (Using Node Cache for simplicity https://www.npmjs.com/package/node-cache)**
```typescript
// Server cache: 10-minute TTL with spatial awareness
const cache = new NodeCache({ stdTTL: 600 });
```

**Purpose**: Serves nearby requests without hitting external APIs
- **Intelligent radius-based matching** using Haversine formula
- Reuses cached data when new requests fall within a cached location's radius
- Example: Request at (40.06, -82.85) with 30km radius can serve a user at (40.07, -82.86)

```typescript
// Geospatial cache hit detection
if (cachedEntry && isNearby(latNum, lngNum, cachedEntry.lat, cachedEntry.lng, cachedEntry.radius)) {
  console.log(`Cache hit for lat: ${lat}, lng: ${lng}, radius: ${radius}`);
  return cachedEntry. data;
}
```

#### 3️⃣ **Individual Venue Cache**
```typescript
// Per-venue caching for quick lookups
cache.set(`venue:${venue.venue_id}`, venue);
```


### ⚖️ Cache Tradeoffs & Solutions

#### The Challenge
Longer cache periods (10 minutes) **reduce API costs** but can lead to **stale busyness data** on initial page load, especially for rapidly changing venues.

#### The Solution: Dual Data Paths
1. **Cached Browse Experience**: Initial page load shows venues from cache (may be up to 10 minutes old)
   - ✅ **Pro**: Instant loading, minimal API usage
   - ⚠️ **Con**: Busyness data may be slightly outdated

2. **Fresh Search Results**: The search feature **always bypasses cache** via direct POST requests
   - ✅ **Pro**: Guaranteed fresh live data for user-selected venues
   - ✅ **Pro**: Users get real-time accuracy when it matters most
   - 💡 **Result**: Best of both worlds—fast browsing + accurate search

```typescript
// Search always hits the API for live data
POST /venues/live-forecast? venue_name=${name}&venue_address=${address}
// No caching applied to this endpoint! 
```

### 📊 Caching Impact
Based on the logs in your screenshots:
- **Multiple cache hits** within 30km radius zones
- **Significant credit savings**: Reduces BestTime API calls by ~70-80%
- **User experience**: Sub-second response times for cached requests

### 📊 Caching Impact - Client Side
<img width="450" height="40" alt="Screenshot 2025-11-30 at 6 32 50 PM" src="https://github.com/user-attachments/assets/1dd89c0c-7db9-4038-92c3-48da721cdf51" />

### 📊 Caching Impact - Server Side

<img width="1132" height="220" alt="Screenshot 2025-11-30 at 6 34 08 PM" src="https://github.com/user-attachments/assets/c19e1f59-3a77-44c9-8890-0e70152803ca" />


---

## 🏛️ Architecture

### Tech Stack

**Frontend**
- **React 18** with TypeScript for type-safe components
- **Vite** for lightning-fast development and optimized builds
- **TanStack Query (React Query)** for intelligent client-side caching
- **React Router** for seamless navigation
- **Leaflet & React-Leaflet** for interactive maps
- **Google Places API** for autocomplete search
- **TailwindCSS** for responsive styling

**Backend (Microservices)**
- **Fastify** for high-performance Node.js APIs
- **NodeCache** for server-side in-memory caching
- **CORS** configuration for secure cross-origin requests
- **TypeScript** for end-to-end type safety

**External APIs**
- **BestTime Radar API** - Live busyness and forecast data
- **Google Places API** - Venue search and autocomplete
- **OpenStreetMap** - Map tiles and geospatial data

**Tooling**
- **Nx Monorepo** for scalable workspace management
- **ESLint & Prettier** for code quality
- **Docker** for containerizing the backend
- **GitHub Actions** for CI/CD
- **GitHub Pages** for deployment



### Custom UI Components
- **NearBrewCard**: Branded container with coffee-themed styling
- **NearBrewAutoComplete**: Google Places integration with custom styling
- **VenueLocationMap**: Interactive Leaflet map with custom coffee pin markers
- **StickyBanner**: Persistent branding with "Buy Me a Coffee" CTA

### Responsive Design
- Mobile-first approach with breakpoint-based layouts
- Touch-friendly interactions for map and search
- Optimized performance for low-bandwidth connections

### Accessibility
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Loading states and error messages


## 📈 Performance Optimizations

1. **Code Splitting**: Dynamic imports for route-based code splitting
2. **Image Optimization**: Lazy loading for map tiles
3. **Memoization**: `useMemo` and `useCallback` for expensive computations
4. **Bundle Size**: Tree-shaking and minification via Vite
5. **API Efficiency**: Strategic caching reduces external API calls by 70-80%

---

## 🔒 Security Considerations

- Environment variables for sensitive API keys
- CORS configuration for allowed origins
- Input validation on all API endpoints
- Rate limiting considerations for production deployment
- Secure HTTPS deployment on GitHub Pages

---

## 🛣️ Things I plan to add in the future, maybe even a mobile app 🤔

- [ ] User authentication and saved favorites
- [ ] Push notifications for when favorite venues become less busy
- [ ] Social features: share venues with friends
- [ ] Historical trend charts with Chart.js
- [ ] Progressive Web App (PWA) support for offline access
- [ ] Backend deployment to cloud provider (AWS/Vercel)
- [ ] Redis integration for distributed caching

---


- [BestTime API](https://besttime.app/) for busyness data
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview) for venue search
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [Nx](https://nx.dev/) for monorepo tooling

---

