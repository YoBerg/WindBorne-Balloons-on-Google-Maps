/*
The Balloon Map Container responsible for containerizing the Google Map
and fetching the coordinates from the backend server which calls the Windborne API.
*/

import React, { useState, useEffect, useRef } from 'react'
import GoogleMapComponent from './GoogleMap'

// Fetch coordinates from API via proxy
async function fetchCoordinates(hoursAgo = 0) {
  // Format hoursAgo as two-digit string (00, 01, 02, etc.)
  const id = String(hoursAgo).padStart(2, '0')
  // Use environment variable for API URL, fallback to relative path in production
  const apiUrl = import.meta.env.DEV 
    ? `http://localhost:3001/api/treasure/${id}`
    : import.meta.env.VITE_API_URL || `/api/treasure/${id}`
  
  const response = await fetch(apiUrl)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  // parse JSON response into list of coordinates
  // example of data:
  // [
  //   [10, 10, 3],
  //   [10, 11, 4],
  //   [11, 10, 5],
  //   [11, 11, 6],
  // ]
  let counter = 0
  const data = await response.json()
  const coordinates = data.map(item => ({
    id: counter += 1,
    lat: item[0],
    lng: item[1],
    altitude: item[2],
  }))
  return coordinates
}

// Center of the United States (geographic center)
const US_CENTER = {
  lat: 39.8283,  // Approximate geographic center of the US
  lng: -98.5795
}

function BalloonMapContainer() {
  const [coordinates, setCoordinates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sliderValue, setSliderValue] = useState(0) // Slider position (updates immediately)
  const [hoursAgo, setHoursAgo] = useState(0) // Actual value used for fetching (debounced)
  const debounceTimerRef = useRef(null)
  const isInitialMount = useRef(true)

  // Debounce slider changes - only fetch after user stops moving for 300ms
  // Skip debounce on initial mount to fetch immediately
  useEffect(() => {
    // On initial mount, set hoursAgo immediately without debounce
    if (isInitialMount.current) {
      isInitialMount.current = false
      setHoursAgo(sliderValue)
      return
    }

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer to update hoursAgo after 300ms of no changes
    debounceTimerRef.current = setTimeout(() => {
      setHoursAgo(sliderValue)
    }, 300)

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [sliderValue])

  // Fetch coordinates when hoursAgo changes (after debounce)
  useEffect(() => {
    async function loadCoordinates() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchCoordinates(hoursAgo)
        setCoordinates(data)
      } catch (err) {
        setError(err.message || 'Failed to fetch coordinates')
        console.error('Error fetching coordinates:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCoordinates()
  }, [hoursAgo]) // Refetch when hoursAgo changes (after debounce)

  // Convert coordinates to markers format (only lat/lng for Google Maps)
  // Filter out any invalid coordinates and ensure lat/lng are numbers
  const markers = coordinates
    .filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng)
    )
    .map(coord => ({
      id: coord.id,
      lat: coord.lat,
      lng: coord.lng,
      altitude: coord.altitude, // Store altitude for future use
    }))

  // Format timestamp label (use sliderValue for immediate feedback)
  const getTimestampLabel = () => {
    const value = sliderValue
    if (value === 0) {
      return 'Current hour'
    }
    if (value === 1) {
      return '1 hour ago'
    }
    return `${value} hours ago`
  }

  return (
    <>
      <p>Tracking {coordinates.length} balloon{coordinates.length !== 1 ? 's' : ''}</p>
      <p>Try clicking on a balloon to track it and see it's coordinates!</p>
      
      {loading && hoursAgo !== sliderValue && (
        <div className="status-message">
          <p>Loading coordinates...</p>
        </div>
      )}
      
      {error && (
        <div className="status-message error">
          <p>Error: {error}</p>
        </div>
      )}
      
      <div className="map-wrapper">
        <div className="time-slider-container">
          <label htmlFor="time-slider" className="time-slider-label">
            Time
          </label>
          <input
            id="time-slider"
            type="range"
            min="0"
            max="24"
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
            className="time-slider"
          />
          <div className="time-slider-value">
            {getTimestampLabel()}
          </div>
        </div>
        <div className="map-container">
          <GoogleMapComponent center={US_CENTER} markers={markers} initialZoom={4} />
        </div>
      </div>
    </>
  )
}

export default BalloonMapContainer

