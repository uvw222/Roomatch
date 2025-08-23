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
  zoom = 15, 
  height = "300px", 
  width = "100%",
  className = ""
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript()
        
        if (!mapRef.current) return

        const position = { lat: latitude, lng: longitude }
        
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
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initializeMap()
  }, [latitude, longitude, zoom])

  return (
    <div 
      ref={mapRef} 
      style={{ height, width }} 
      className={`rounded-lg border ${className}`}
    />
  )
}
