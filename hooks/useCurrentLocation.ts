import { useState, useEffect } from 'react'

interface LocationData {
  location: string
  latitude: number
  longitude: number
  timestamp: number
}

export function useCurrentLocation() {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Try to get stored location from localStorage
    const storedLocation = localStorage.getItem('userLocation')
    if (storedLocation) {
      try {
        const data = JSON.parse(storedLocation)
        setLocationData(data)
      } catch (error) {
        console.error('Error parsing stored location:', error)
      }
    }
  }, [])

  const detectLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      setIsLoading(true)

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
            const locationData: LocationData = {
              location: locationName,
              latitude: lat,
              longitude: lng,
              timestamp: Date.now()
            }

            // Store in localStorage
            localStorage.setItem('userLocation', JSON.stringify(locationData))
            setLocationData(locationData)
            setIsLoading(false)
            resolve(locationData)
          } catch (error) {
            console.error('Error getting location name:', error)
            const locationData: LocationData = {
              location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              latitude: lat,
              longitude: lng,
              timestamp: Date.now()
            }
            localStorage.setItem('userLocation', JSON.stringify(locationData))
            setLocationData(locationData)
            setIsLoading(false)
            resolve(locationData)
          }
        },
        (error) => {
          setIsLoading(false)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  const clearLocation = () => {
    localStorage.removeItem('userLocation')
    setLocationData(null)
  }

  return {
    locationData,
    isLoading,
    detectLocation,
    clearLocation
  }
}
