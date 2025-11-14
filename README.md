# Google Maps Balloons Project

A React web application that visualizes Windborne balloon tracking data on an interactive Google Maps interface. The app displays balloon coordinates (latitude, longitude, altitude) as markers on a satellite map view, allowing users to explore balloon positions over the past 24 hours using a time slider.

## Overview

This application fetches real-time balloon tracking data from the Windborne Systems API and displays it on a Google Maps satellite view. Key features include:

- **Interactive Map**: Satellite/earth view with customizable markers showing balloon positions
- **Time Slider**: Navigate through balloon positions from the current hour up to 24 hours ago
- **InfoWindows**: Click on any balloon marker to see detailed coordinates (latitude, longitude, altitude)
- **Dynamic Scaling**: Marker sizes automatically adjust based on zoom level to reduce clutter
- **Caching**: Backend implements intelligent caching to minimize API calls (updates hourly, stores 24 hours of data)
- **Dark/Light Mode**: Automatically adapts to your browser's theme preference

The frontend is built with React and Vite, while the backend uses Express.js to proxy API requests and handle CORS issues.

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher) and npm installed
- Google Maps API key

### Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### Getting a Map ID (Required for Tilt/Rotation)

**Map ID is required for WebGL features like tilt and rotation to work.**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Maps" > "Map Styles"
3. Click "Create Map Style" or use an existing one
4. Copy the **Map ID** (looks like: `90f87356969d889c`)
5. Add it to your `.env` file as `VITE_GOOGLE_MAPS_MAP_ID`

**Note:** You can also create a Map ID via the [Map Styles page](https://console.cloud.google.com/google/maps-apis/studio/maps) or use the default Map ID from the [tilt and rotation example](https://developers.google.com/maps/documentation/javascript/examples/webgl/webgl-tilt-rotation).

For more details, see the [Google Maps Platform documentation](https://developers.google.com/maps/documentation/javascript/place-get-started).

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

3. Create a `.env` file in the **root directory** (same level as `package.json`, NOT in the `src` folder) and add your Google Maps API key and Map ID:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
```

**Note:** Map ID is optional but **required for tilt/rotation features** to work. Without it, the map will still work but tilt won't be applied.

**Important:** 
- The `.env` file must be in the root folder (where `package.json` is located)
- The variable name **must** start with `VITE_` for Vite to expose it to your React code
- After creating/updating the `.env` file, restart your dev server

## Running the Application

### Quick Start

**Option 1: Run both frontend and backend separately (recommended)**

Open two terminal windows:

**Terminal 1 - Start the backend server:**
```bash
npm run backend:dev
```
The backend will start on `http://localhost:3001`

**Terminal 2 - Start the frontend development server:**
```bash
npm run dev
```
The frontend will automatically open in your browser at `http://localhost:3000`

**Option 2: Run both together (requires `concurrently` package)**

First install concurrently if you haven't already:
```bash
npm install --save-dev concurrently
```

Then run both servers together:
```bash
npm run dev:all
```

### What to Expect

Once the app is running:
1. You'll see a Google Maps satellite view centered on the United States
2. Balloon markers will appear on the map (red markers by default, or custom images if configured)
3. Use the time slider on the left to view balloon positions from 0-24 hours ago
4. Click on any balloon marker to see its coordinates in an InfoWindow
5. The map supports zoom, pan, and all standard Google Maps controls

**Note:** Make sure both the frontend (port 3000) and backend (port 3001) are running for the app to work properly.

## Using Custom Marker Images

To use a custom marker icon:

1. Place your PNG image file in the `public/images/` folder
   - Example: `public/images/balloon_2831721.png`

2. Add the filename to your `.env` file:
   ```
   VITE_MARKER_IMAGE=balloon_2831721.png
   ```

If the image is not provided or can't be loaded, the default red marker icon will be used.

**Note:** The marker image scales automatically based on zoom level to reduce clutter when zoomed out.