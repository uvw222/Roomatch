"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CurrentLocationDetector() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [hasDetected, setHasDetected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we've already detected location in this session
    const hasDetectedThisSession = sessionStorage.getItem('locationDetected')
    
    if (!hasDetectedThisSession && navigator.geolocation) {
      setIsDetecting(true)
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          try {
            // Reverse geocode to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
            )
            const data = await response.json()
            
            const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            
            // Store location in localStorage for use throughout the app
            localStorage.setItem('userLocation', JSON.stringify({
              location: locationName,
              latitude: lat,
              longitude: lng,
              timestamp: Date.now()
            }))
            
            // Mark as detected for this session
            sessionStorage.setItem('locationDetected', 'true')
            setHasDetected(true)
            
            console.log('Current location detected:', locationName)
          } catch (error) {
            console.error('Error getting location name:', error)
            // Still use coordinates if geocoding fails
            const locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            localStorage.setItem('userLocation', JSON.stringify({
              location: locationName,
              latitude: lat,
              longitude: lng,
              timestamp: Date.now()
            }))
            sessionStorage.setItem('locationDetected', 'true')
            setHasDetected(true)
          }
          
          setIsDetecting(false)
        },
        (error) => {
          console.error('Error getting current location:', error)
          setIsDetecting(false)
          // Don't mark as detected if it failed
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    }
  }, [])

  if (isDetecting) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Detecting your current location...</p>
          <p className="text-sm text-gray-500 mt-2">This helps us show you relevant matches nearby</p>
        </div>
      </div>
    )
  }

  return null
}
