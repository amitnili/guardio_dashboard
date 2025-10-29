# Funnel Reliability Dashboard - Testing Guide

## Overview
This is a fully functional Funnel Reliability Dashboard built with React + TypeScript + Tailwind CSS that monitors Guardio's phone collection onboarding funnel.

## Quick Start

### 1. Start the Development Server

```bash
cd /home/nili/Projects/Guardio/funnel-dashboard
npm run dev
```

The dashboard will be available at **http://localhost:5173**

### 2. Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the complete dashboard with:
- 4-stage funnel visualization
- Reliability metrics table
- Real-time alerts panel
- Trend analysis graphs
- Overall health summary

## What's Included

### ✅ Features Implemented

1. **Funnel Overview**
   - 4 stages: Visitors → Next Page → Phone Collected → Activation
   - Color-coded stages (Blue → Indigo → Purple → Violet)
   - Conversion rates, drop-off rates, week-over-week deltas
   - Responsive design with arrow connectors

2. **Reliability Metrics Table**
   - Client Layer: Abandon Rate
   - Server Layer: Success Rate, Response Time
   - Provider Layer: API Latency
   - Data Quality Layer: Event Completeness
   - Color-coded badges by layer and status
   - Status icons (✓, ⚠, ✗)

3. **Real-time Alerts Panel**
   - Critical and warning alerts
   - Timestamp with "X minutes ago" format
   - Color-coded cards by severity
   - Sticky sidebar on desktop

4. **Trend Analysis (24h)**
   - 4 mini trend cards
   - Current value, change, and trend direction
   - Status indicators
   - Threshold information

5. **Health Summary**
   - Overall funnel health status
   - Dynamic emoji indicators (🔴🟠🟢)
   - Alert counts
   - Last updated timestamp

6. **Auto-refresh Functionality**
   - Toggle auto-refresh on/off
   - 30-second refresh interval
   - Manual refresh button
   - Loading states with skeleton screens

### 🎨 Visual Design

**Color Scheme:**
- Primary: Gray/Slate for UI
- Critical: Red (#EF4444)
- Warning: Orange (#F97316)
- Healthy: Green (#10B981)
- Layer badges: Blue, Purple, Indigo, Green

**Layout:**
- Responsive grid layout
- Sticky alerts panel on desktop
- Mobile-friendly stacked layout
- Hover effects and transitions

## Mock Data

The dashboard currently uses **mock API data** (no real backend needed):

### Mock API Endpoints
- `mockApi.getMetrics()` - Returns funnel and reliability metrics
- `mockApi.getAlerts()` - Returns active alerts

### Data Location
- **API Client**: `src/api/mockApi.ts`
- **Types**: `src/types/dashboard.ts`
- **Transformations**: `src/utils/dashboardData.ts`

## Testing Different States

### Test Auto-refresh
1. Click "Auto-refresh ON" button to toggle off
2. Click again to re-enable
3. Watch the "Last updated" timestamp update every minute

### Test Manual Refresh
1. Click the "Refresh" button
2. Watch for the spinning icon
3. Data will reload (with 300-500ms simulated delay)

### Test Responsive Design
1. Resize your browser window
2. Mobile view: Components stack vertically
3. Desktop view: 3-column layout with sticky alerts

### Test Loading States
1. On initial load, you'll see skeleton screens
2. Refresh to see them again briefly

## Project Structure

```
funnel-dashboard/
├── src/
│   ├── api/
│   │   └── mockApi.ts              # Mock API with sample data
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── card.tsx
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   └── skeleton.tsx
│   │   └── dashboard/              # Dashboard-specific components
│   │       ├── FunnelOverview.tsx
│   │       ├── ReliabilityMetrics.tsx
│   │       ├── AlertsPanel.tsx
│   │       ├── TrendGraphs.tsx
│   │       └── HealthSummary.tsx
│   ├── pages/
│   │   └── Dashboard.tsx           # Main dashboard page
│   ├── types/
│   │   └── dashboard.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── dashboardData.ts        # Data transformation utilities
│   ├── lib/
│   │   └── utils.ts                # Helper functions
│   ├── App.tsx                     # React Query provider
│   └── main.tsx                    # Entry point
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Query (@tanstack/react-query)** - Data fetching and caching
- **date-fns** - Date formatting
- **lucide-react** - Icons
- **shadcn/ui** pattern - UI component architecture

## Connecting to Real API

To connect to your actual backend:

1. **Update API Client** (`src/api/mockApi.ts`):
   ```typescript
   export const api = {
     getMetrics: async () => {
       const response = await fetch('/api/metrics');
       return response.json();
     },
     getAlerts: async () => {
       const response = await fetch('/api/alerts');
       return response.json();
     }
   };
   ```

2. **Update Dashboard Component** (`src/pages/Dashboard.tsx`):
   ```typescript
   import { api } from "../api/api"; // instead of mockApi

   queryFn: api.getMetrics, // use real API
   ```

3. **Configure Vite Proxy** (if needed in `vite.config.ts`):
   ```typescript
   export default defineConfig({
     server: {
       proxy: {
         '/api': 'http://your-backend-url:3000'
       }
     }
   });
   ```

## Build for Production

```bash
npm run build
```

This creates optimized production files in `dist/`

## Serve Production Build

```bash
npm run preview
```

## Troubleshooting

### Port Already in Use
If port 5173 is busy:
```bash
npm run dev -- --port 3000
```

### TypeScript Errors
Restart the TypeScript server in VS Code:
- Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

### Styling Issues
If Tailwind classes don't work:
1. Check `tailwind.config.js` content paths
2. Restart dev server

### Path Alias Issues
If `@/` imports fail:
1. Check `tsconfig.app.json` paths configuration
2. Check `vite.config.ts` resolve aliases
3. Restart VS Code

## Next Steps

### Enhancements You Could Add:

1. **Real-time Updates**
   - WebSocket connection for live data
   - Toast notifications for new alerts

2. **Advanced Filtering**
   - Date range picker
   - Filter by layer, status, severity
   - Search functionality

3. **Data Visualization**
   - Add Recharts line graphs (currently simplified)
   - Historical trend analysis
   - Comparative metrics

4. **Export Features**
   - Export metrics as CSV
   - PDF report generation
   - Share dashboard snapshots

5. **User Preferences**
   - Dark mode toggle
   - Customizable refresh intervals
   - Saved filter presets

6. **Alert Management**
   - Acknowledge/resolve alerts
   - Alert detail modal
   - Alert history view

## Support

For issues or questions:
- Check browser console for errors
- Verify all dependencies installed: `npm install`
- Try clearing node_modules: `rm -rf node_modules && npm install`

## License

This is a demo dashboard for Guardio's internal use.
