"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CurrentLocationDetector() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [hasDetected, setHasDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRetry, setShowRetry] = useState(false)
  const router = useRouter()

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      setShowRetry(false)
      return
    }

    setError(null)
    setShowRetry(false)
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
          
          // Set user-friendly error message based on error code
          let errorMessage = "Unable to detect location. "
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access and try again."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage += "The request to get your location timed out."
              break
            default:
              errorMessage += "An unknown error occurred."
              break
          }
          
          setError(errorMessage)
          setShowRetry(true)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
  }

  useEffect(() => {
    // Check if we've already detected location in this session
    const hasDetectedThisSession = sessionStorage.getItem('locationDetected')
    
    if (!hasDetectedThisSession) {
      detectLocation()
    }
  }, [])

  const handleSkip = () => {
    setError(null)
    setShowRetry(false)
    setIsDetecting(false)
    // Mark as detected to prevent showing again this session
    sessionStorage.setItem('locationDetected', 'true')
  }

  if (isDetecting) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-200">Detecting your current location...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This helps us show you relevant matches nearby</p>
          <button 
            onClick={handleSkip}
            className="mt-4 text-sm text-orange-600 hover:text-orange-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  if (error && showRetry) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-gray-200 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={detectLocation}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={handleSkip}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
