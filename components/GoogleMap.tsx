"use client"

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMapsScript } from '@/lib/googleMapsLoader'

interface GoogleMapProps {
  latitude: number
  longitude: number
  zoom?: number
  height?: string
  width?: string
  className?: string
}

export default function GoogleMap({ 
  latitude, 
  longitude, 
  zoom = 18, 
  height = "300px", 
  width = "100%",
  className = ""
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Validate coordinates and ensure they are numbers
  const lat = Number(latitude)
  const lng = Number(longitude)
  
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return (
      <div 
        style={{ height, width }} 
        className={`rounded-lg border flex items-center justify-center bg-gray-100 ${className}`}
      >
        <p className="text-gray-500">Invalid coordinates: {latitude}, {longitude}</p>
      </div>
    )
  }

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Check if Google Maps API key is available
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key not configured')
        }
        
        await loadGoogleMapsScript()
        
        if (!mapRef.current) return

        const position = { lat, lng }
        
        const newMap = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        const newMarker = new google.maps.Marker({
          position: position,
          map: newMap,
          title: 'Location',
        })

        setMap(newMap)
        setMarker(newMarker)
        setError(null)
      } catch (error) {
        console.error('Error initializing map:', error)
        setError('Failed to load map. Please check your internet connection.')
      }
    }

    initializeMap()
  }, [latitude, longitude, zoom])

  if (error) {
    return (
      <div 
        style={{ height, width }} 
        className={`rounded-lg border flex items-center justify-center bg-gray-100 ${className}`}
      >
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height, width }} 
      className={`rounded-lg border ${className}`}
    />
  )
}
