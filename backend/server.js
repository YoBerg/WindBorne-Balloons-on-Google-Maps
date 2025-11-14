import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the React app build directory
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Cache for API responses
// Key: hour timestamp (rounded down to nearest hour)
// Value: { data: ..., timestamp: ... }
const cache = new Map();

// Calculate the hour timestamp (rounded down to nearest hour)
function getHourTimestamp(date = new Date()) {
  const hourTimestamp = new Date(date);
  hourTimestamp.setMinutes(0, 0, 0); // Round down to nearest hour
  return hourTimestamp.getTime();
}

// Calculate the actual hour for a given API ID
// ID "00" = current hour, "01" = 1 hour ago, etc.
function getActualHourForId(id) {
  const hoursAgo = parseInt(id, 10);
  if (isNaN(hoursAgo)) {
    return null;
  }
  
  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() - hoursAgo);
  return getHourTimestamp(targetDate);
}

// Clean up cache entries older than 24 hours
function cleanCache() {
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  for (const [key, value] of cache.entries()) {
    if (value.timestamp < twentyFourHoursAgo) {
      cache.delete(key);
      console.log(`Cleaned cache entry for hour: ${new Date(key).toISOString()}`);
    }
  }
}

// Run cache cleanup every hour
setInterval(cleanCache, 60 * 60 * 1000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Proxy endpoint for treasure/balloon coordinates with caching
app.get('/api/treasure/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Calculate the actual hour timestamp for this API ID
    const hourTimestamp = getActualHourForId(id);
    if (hourTimestamp === null) {
      return res.status(400).json({ 
        error: 'Invalid ID format. Must be a number (00, 01, 02, etc.)' 
      });
    }
    
    // Check cache first
    const cached = cache.get(hourTimestamp);
    if (cached) {
      console.log(`Cache HIT for hour: ${new Date(hourTimestamp).toISOString()} (ID: ${id})`);
      return res.json(cached.data);
    }
    
    // Cache miss - fetch from API
    const targetUrl = `https://a.windbornesystems.com/treasure/${id}.json`;
    console.log(`Cache MISS - Fetching from API: ${targetUrl} (hour: ${new Date(hourTimestamp).toISOString()})`);
    
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch data: ${response.status} ${response.statusText}` 
      });
    }
    
    const data = await response.json();
    
    // Store in cache
    cache.set(hourTimestamp, {
      data: data,
      timestamp: Date.now()
    });
    
    console.log(`Cached data for hour: ${new Date(hourTimestamp).toISOString()} (ID: ${id})`);
    
    // Clean old cache entries periodically
    if (cache.size > 24) {
      cleanCache();
    }
    
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Serve React app for all non-API routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Proxy endpoint: http://localhost:${PORT}/api/treasure/:id`);
});

