# Village Impact Assessment - Frontend

React.js web application with Leaflet maps for visualizing village population data interactively.

## Quick Start

```bash
npm install
npm start
```

Application opens at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── MapComponent.js      # Leaflet map with villages
│   ├── FilterPanel.js       # State/District/Subdistrict filters
│   ├── StatsPanel.js        # Population statistics
│   └── FileUpload.js        # Shapefile upload interface
├── App.js                   # Main application component
├── App.css                  # Global styles
└── index.js                 # React entry point
```

## Tech Stack

- **React.js 18** - Component-based UI framework
- **Leaflet** - Interactive mapping library  
- **Vanilla CSS** - Custom styling (no UI frameworks)
- **Fetch API** - HTTP requests to backend

## Map Features

### Interactive Map (MapComponent)
- **Base Map** - OpenStreetMap tiles (free)
- **Village Rendering** - Color-coded by population
- **Zoom-based Display** - Circles (low zoom) → Polygons (high zoom)
- **Viewport Loading** - Only render visible villages
- **Click Interactions** - Village info popups

### Smart Rendering System
```javascript
// Zoom levels 1-10: Circle markers for performance
// Zoom levels 11+: Detailed polygon boundaries
// Dynamic sizing based on population and zoom
```

## Components Overview

### App.js - Main Container
- Application state management
- Data fetching coordination  
- Component orchestration
- Upload flow handling

### FilterPanel.js - Hierarchical Filtering
- **State Selection** - Dropdown with all states
- **District Selection** - Updates based on selected state
- **Subdistrict Selection** - Updates based on selected district
- **Breadcrumb Navigation** - Shows current filter path
- **Clear Filters** - Reset all selections

### MapComponent.js - Interactive Map
- **Leaflet Integration** - Full-featured mapping
- **Performance Optimized** - Efficient layer management
- **Responsive Design** - Works on mobile devices
- **Custom Markers** - Population-based styling

### StatsPanel.js - Analytics Display
- **Basic Statistics** - Total villages, population, averages
- **Population Range** - Min/max values
- **Insights** - Density categories and recommendations
- **Real-time Updates** - Changes with filters

### FileUpload.js - Data Import
- **Drag & Drop** - Intuitive file selection
- **Validation** - Required vs optional file checking
- **Progress Tracking** - Visual upload feedback
- **Error Handling** - Clear error messages

## Styling Architecture

### CSS Organization
```
App.css              # Global styles, layout, utilities
MapComponent.css     # Map-specific styles, popups  
FilterPanel.css      # Form controls, dropdowns
StatsPanel.css       # Statistics cards, charts
FileUpload.css       # Upload area, progress bars
```

### Design System
- **Colors** - Blue primary (#007bff), semantic colors
- **Typography** - System fonts, clear hierarchy
- **Spacing** - Consistent 8px grid system
- **Components** - Reusable button/form styles

## Performance Optimizations

### Data Loading
- **Viewport-based Queries** - Only load visible villages
- **Zoom-dependent Limits** - Fewer markers at low zoom
- **Debounced Updates** - Prevent excessive API calls

### Map Rendering  
- **Layer Management** - Efficient add/remove of markers
- **Memory Cleanup** - Proper disposal of map objects
- **Batch Updates** - Group marker operations

### State Management
- **Minimal Re-renders** - Strategic useEffect dependencies
- **Local State** - Component-level state where appropriate
- **Prop Optimization** - Avoid unnecessary prop drilling

## Data Flow

```
User Interaction → State Update → API Call → Data Processing → Map Update
```

### Example: State Selection
1. User selects state in FilterPanel
2. `handleStateChange` updates state
3. `fetchVillages` calls API with new filter
4. Villages data updates MapComponent
5. Map re-renders with new villages
6. StatsPanel updates with new statistics

## Responsive Design

### Breakpoints
- **Desktop** - `> 768px` - Full sidebar layout
- **Mobile** - `≤ 768px` - Stacked layout

### Mobile Optimizations
- **Touch-friendly** - Larger tap targets
- **Compact Layout** - Collapsible sidebar
- **Performance** - Reduced marker limits

## Configuration

### Environment Variables (.env)
```bash
# Backend API URL (optional, uses proxy)
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Development settings
GENERATE_SOURCEMAP=false
```

### Proxy Configuration (package.json)
```json
{
  "proxy": "http://localhost:5000"
}
```

## API Integration

### Base URL Resolution
```javascript
// Uses proxy in development, configurable for production
const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
```

### Error Handling
- **Network Errors** - User-friendly messages
- **API Errors** - Display server error messages  
- **Loading States** - Visual feedback during requests
- **Fallback Data** - Graceful degradation

## Component Props Interface

### MapComponent Props
```javascript
{
  villages: Array,        // Village data with geometry
  loading: boolean,       // Show loading spinner
  selectedState: string,  // Current state filter
  selectedDistrict: string,
  selectedSubdistrict: string
}
```

### FilterPanel Props  
```javascript
{
  selectedState: string,
  selectedDistrict: string, 
  selectedSubdistrict: string,
  onStateChange: function,
  onDistrictChange: function,
  onSubdistrictChange: function
}
```

## Development

### Available Scripts
```bash
npm start           # Development server (hot reload)
npm build          # Production build  
npm test           # Run tests
npm eject          # Eject from Create React App
```

### Adding New Components
1. Create component file in `src/components/`
2. Create corresponding CSS file
3. Import and use in parent component
4. Follow existing naming conventions

## Debugging

### Common Issues

**Map Not Loading**
- Check network tab for tile loading errors
- Verify internet connection for OpenStreetMap

**Villages Not Displaying**  
- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Confirm backend is running on port 5000

**Performance Issues**
- Monitor village count in map info panel
- Check zoom level for polygon rendering
- Use React DevTools to identify re-renders

### Browser Support
- **Chrome/Edge** - Full support
- **Firefox** - Full support  
- **Safari** - Full support
- **Mobile Browsers** - Optimized experience

## Dependencies

### Production
- `react` - UI framework
- `react-dom` - React DOM rendering
- `leaflet` - Mapping library

### Development
- `react-scripts` - Build tooling
- `web-vitals` - Performance monitoring

## Deployment

### Build for Production
```bash
npm run build
```

### Static File Serving
The `build/` folder contains optimized static files ready for deployment to:
- **Netlify** - Drag and drop deployment
- **Vercel** - Git-based deployment  
- **Apache/Nginx** - Traditional web servers

### Environment Configuration
Update API endpoints for production:
```bash
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```# Village-Impact-Assessment-Map-Application-Frontend
