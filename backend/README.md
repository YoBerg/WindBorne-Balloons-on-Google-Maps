# Backend Server

Simple Express proxy server to handle CORS for the frontend.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## Endpoints

- `GET /health` - Health check
- `GET /api/treasure/:id` - Proxy endpoint for balloon coordinates
  - Example: `GET /api/treasure/00` fetches from `https://a.windbornesystems.com/treasure/00.json`
- `GET /images/:filename` - Serve static images (marker icons, etc.)
  - Place images in `backend/public/images/`
  - Example: `GET /images/balloon-marker.png` serves `backend/public/images/balloon-marker.png`

## Serving Custom Marker Images

1. Place your PNG/JPG marker image in `backend/public/images/`
   - Example: `backend/public/images/balloon-marker.png`

2. The image will be accessible at: `http://localhost:3001/images/balloon-marker.png`

3. In your frontend, pass the image filename to `GoogleMapComponent`:
   ```jsx
   <GoogleMapComponent 
     center={center} 
     markers={markers}
     markerImage="balloon-marker.png"
   />
   ```

## Environment Variables

- `PORT` - Server port (default: 3001)

