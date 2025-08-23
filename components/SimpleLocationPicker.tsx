"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search } from 'lucide-react'

interface SimpleLocationPickerProps {
  onLocationSelect: (location: string, latitude: number, longitude: number) => void
  initialLocation?: string
  initialLatitude?: number
  initialLongitude?: number
}

export default function SimpleLocationPicker({ 
  onLocationSelect, 
  initialLocation = "", 
  initialLatitude, 
  initialLongitude 
}: SimpleLocationPickerProps) {
  const [location, setLocation] = useState(initialLocation)
  const [latitude, setLatitude] = useState(initialLatitude?.toString() || "")
  const [longitude, setLongitude] = useState(initialLongitude?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleLocationSubmit = () => {
    if (location.trim() && latitude && longitude) {
      onLocationSelect(location, Number(latitude), Number(longitude))
    }
  }

  const handleCoordinateSubmit = () => {
    if (latitude && longitude) {
      // Use coordinates as location if no location name provided
      const locationName = location.trim() || `${latitude}, ${longitude}`
      onLocationSelect(locationName, Number(latitude), Number(longitude))
    }
  }

  const getCurrentLocation = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLatitude(lat.toString())
          setLongitude(lng.toString())
          
          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              setLocation(data.display_name || `${lat}, ${lng}`)
              onLocationSelect(data.display_name || `${lat}, ${lng}`, lat, lng)
            })
            .catch(() => {
              setLocation(`${lat}, ${lng}`)
              onLocationSelect(`${lat}, ${lng}`, lat, lng)
            })
            .finally(() => setIsLoading(false))
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLoading(false)
          alert('Could not get your current location. Please enter coordinates manually.')
        }
      )
    } else {
      setIsLoading(false)
      alert('Geolocation is not supported by this browser.')
    }
  }

  // Check if we have stored location data on component mount
  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation')
    if (storedLocation && !initialLocation) {
      try {
        const locationData = JSON.parse(storedLocation)
        setLocation(locationData.location)
        setLatitude(locationData.latitude.toString())
        setLongitude(locationData.longitude.toString())
      } catch (error) {
        console.error('Error parsing stored location:', error)
      }
    }
  }, [initialLocation])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Location Name</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location name (e.g., New York, NY)"
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium">Latitude</label>
          <Input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="40.7128"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Longitude</label>
          <Input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="-74.0060"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={getCurrentLocation} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? "Getting location..." : "Use Current Location"}
        </Button>
        <Button 
          onClick={handleLocationSubmit}
          disabled={!location.trim() || !latitude || !longitude}
          size="sm"
        >
          <Search className="h-4 w-4 mr-1" />
          Save Location
        </Button>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>• Enter a location name and coordinates</p>
        <p>• Or click "Use Current Location" to automatically detect your position</p>
        <p>• You can find coordinates on Google Maps by right-clicking on a location</p>
      </div>
    </div>
  )
}
