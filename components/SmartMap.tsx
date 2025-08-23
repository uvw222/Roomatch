"use client"

import { useState, useEffect } from "react"
import GoogleMap from "./GoogleMap"
import OpenStreetMap from "./OpenStreetMap"

interface SmartMapProps {
  latitude: number
  longitude: number
  zoom?: number
  height?: string
  width?: string
  className?: string
}

export default function SmartMap(props: SmartMapProps) {
  const [useGoogleMaps, setUseGoogleMaps] = useState(true)
  const [showFallback, setShowFallback] = useState(false)

  console.log('SmartMap: Received props:', props)

  useEffect(() => {
    // Check if Google Maps API key is configured
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.log('SmartMap: No Google Maps API key, using OpenStreetMap')
      setUseGoogleMaps(false)
      setShowFallback(true)
    }
  }, [])

  const handleGoogleMapsError = () => {
    console.log('GoogleMaps failed, switching to OpenStreetMap')
    setUseGoogleMaps(false)
    setShowFallback(true)
  }

  if (showFallback || !useGoogleMaps) {
    return <OpenStreetMap {...props} />
  }

  return (
    <div>
      <GoogleMap {...props} />
      {/* Hidden fallback that will be shown if Google Maps fails */}
      <div style={{ display: 'none' }}>
        <OpenStreetMap {...props} />
      </div>
    </div>
  )
}
