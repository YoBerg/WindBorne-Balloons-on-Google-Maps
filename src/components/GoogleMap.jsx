/*
The Google Map Component responsible for embedding and rendering the Google Map
and other elements displayed on the map.
*/

import React, { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import '../App.css'

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
}

// Default placeholder center (San Francisco)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
}

// Default placeholder marker position (San Francisco)
const defaultPosition = {
  lat: 37.7749,
  lng: -122.4194
}

// Calculate marker size based on zoom level
// Smaller at low zoom (zoomed out), larger at high zoom (zoomed in)
const calculateMarkerSize = (zoom) => {
  // Zoom levels typically range from 1 (world view) to 20 (street level)
  // Scale from 8px at zoom 1 to 30px at zoom 15+
  const minSize = 8   // Minimum size when zoomed all the way out
  const maxSize = 100  // Maximum size when zoomed in
  const minZoom = 2   // World view
  const maxZoom = 15  // Street level
  
  // Clamp zoom to valid range
  const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom))
  
  // Linear interpolation
  const size = minSize + ((clampedZoom - minZoom) / (maxZoom - minZoom)) * (maxSize - minSize)
  
  return Math.round(size)
}

// Create marker icon
// Size scales based on zoom level to reduce clutter when zoomed out
// If local filename is provided, use it from public/images/; otherwise use default SVG icon
const createMarkerIcon = (imageFilename = null, zoom = 10) => {
  const size = calculateMarkerSize(zoom)
  
  // If local image filename is provided, use it from public/images/
  if (imageFilename) {
    return {
      url: `/images/${imageFilename}`,
      scaledSize: { width: size, height: size },
      anchor: { x: size / 2, y: size }
    }
  }
  
  // Default: use SVG icon (scaled)
  const svgSize = Math.round(size * 0.67)
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="${svgSize}" height="${Math.round(svgSize * 1.5)}" viewBox="0 0 20 30" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0C4.5 0 0 4.5 0 10c0 7 10 20 10 20s10-13 10-20c0-5.5-4.5-10-10-10z" fill="#FF0000" stroke="#FFFFFF" stroke-width="2"/>
      </svg>
    `),
    scaledSize: { width: svgSize, height: Math.round(svgSize * 1.5) },
    anchor: { x: svgSize / 2, y: Math.round(svgSize * 1.5) }
  }
}

function GoogleMapComponent({ center = defaultCenter, markers = [defaultPosition], initialZoom = 4}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const markerImage = import.meta.env.VITE_MARKER_IMAGE || null
  const [zoom, setZoom] = useState(initialZoom) // Track current zoom level
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState(null) // Track which marker is selected/hovered
  
  // Preload and validate the local image file
  useEffect(() => {
    if (markerImage) {
      const img = new Image()
      img.onload = () => {
        setImageLoadFailed(false)
      }
      img.onerror = () => {
        console.warn('Failed to load marker image:', markerImage, '- using default marker')
        setImageLoadFailed(true)
      }
      img.src = `/images/${markerImage}`
    } else {
      setImageLoadFailed(false)
    }
  }, [markerImage])
  
  if (!apiKey) {
    return (
      <div className="api-key-error">
        <p>Google Maps API key not found!</p>
        <p>Please create a <code>.env</code> file in the <strong>root folder</strong> (same level as package.json) with:</p>
        <code>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
        <p className="api-key-note">
          Note: In Vite, environment variables must start with <code>VITE_</code> to be accessible in client code.
        </p>
      </div>
    )
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={(map) => {
          // Listen to zoom changes and update state
          const zoomListener = map.addListener('zoom_changed', () => {
            const currentZoom = map.getZoom()
            setZoom(currentZoom)
          })
          
          // Set initial zoom
          setZoom(map.getZoom())
        }}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
          mapTypeId: 'satellite', // Set to satellite/earth view
        }}
      >
        // Map through the markers and create a marker for each one
        {markers.map((marker, index) => {
          // Use custom image only if it's provided and didn't fail to load
          const iconUrl = (markerImage && !imageLoadFailed) ? markerImage : null
          // Create a unique identifier for each marker
          const markerKey = marker.id !== undefined ? marker.id : `marker-${index}`
          const isSelected = selectedMarker === markerKey
          const markerId = marker.id !== undefined ? marker.id : index + 1
          
          return (
            <Marker
              key={markerKey}
              position={marker}
              title={`Balloon ${markerId}`}
              icon={createMarkerIcon(iconUrl, zoom)}
              onClick={() => {
                // Close any existing InfoWindow by setting to null first
                if (selectedMarker !== null && selectedMarker !== markerKey) {
                  setSelectedMarker(null)
                  // Use requestAnimationFrame to ensure state update completes before opening new one
                  requestAnimationFrame(() => {
                    setSelectedMarker(markerKey)
                  })
                } else {
                  // Toggle: if clicking the same marker, close it; otherwise open it
                  setSelectedMarker(selectedMarker === markerKey ? null : markerKey)
                }
              }}
            >
              // If the marker is selected, show the InfoWindow
              {isSelected && (
                <InfoWindow
                  key={`infowindow-${markerKey}-${selectedMarker}`}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="info-window">
                    <p><strong>Balloon {markerId}</strong></p>
                    <p>Latitude: {marker.lat.toFixed(4)}°</p>
                    <p>Longitude: {marker.lng.toFixed(4)}°</p>
                    {marker.altitude !== undefined && (
                      <p>Altitude: {marker.altitude.toFixed(2)} km</p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )
        })}
      </GoogleMap>
    </LoadScript>
  )
}

export default GoogleMapComponent

