"use client"

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search } from 'lucide-react'
import { loadGoogleMapsScript } from '@/lib/googleMapsLoader'

interface LocationPickerProps {
  onLocationSelect: (location: string, latitude: number, longitude: number) => void
  initialLocation?: string
  initialLatitude?: number
  initialLongitude?: number
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation = "", 
  initialLatitude, 
  initialLongitude 
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation)
  const [isLoading, setIsLoading] = useState(false)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript()
        
        if (!mapRef.current || !searchInputRef.current) return

        // Initialize map
        const defaultPosition = initialLatitude && initialLongitude 
          ? { lat: initialLatitude, lng: initialLongitude }
          : { lat: 40.7128, lng: -74.0060 } // Default to NYC

        const newMap = new google.maps.Map(mapRef.current, {
          center: defaultPosition,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        // Initialize autocomplete
        const newAutocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['geocode'],
        })

        // Add marker if initial coordinates exist
        if (initialLatitude && initialLongitude) {
          const newMarker = new google.maps.Marker({
            position: { lat: initialLatitude, lng: initialLongitude },
            map: newMap,
            draggable: true,
          })
          setMarker(newMarker)
        }

        // Handle place selection
        newAutocomplete.addListener('place_changed', () => {
          const place = newAutocomplete.getPlace()
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            
            newMap.setCenter({ lat, lng })
            newMap.setZoom(18)

            // Update or create marker
            if (marker) {
              marker.setPosition({ lat, lng })
            } else {
              const newMarker = new google.maps.Marker({
                position: { lat, lng },
                map: newMap,
                draggable: true,
              })
              setMarker(newMarker)
            }

            onLocationSelect(place.formatted_address || searchQuery, lat, lng)
          }
        })

        // Handle marker drag
        if (marker) {
          marker.addListener('dragend', () => {
            const position = marker.getPosition()
            if (position) {
              const lat = position.lat()
              const lng = position.lng()
              
              // Reverse geocode to get address
              const geocoder = new google.maps.Geocoder()
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  const address = results[0].formatted_address
                  setSearchQuery(address)
                  onLocationSelect(address, lat, lng)
                }
              })
            }
          })
        }

        setMap(newMap)
        setAutocomplete(newAutocomplete)
      } catch (error) {
        console.error('Error initializing location picker:', error)
      }
    }

    initializeMap()
  }, [initialLatitude, initialLongitude, onLocationSelect])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        setIsLoading(false)
        if (status === 'OK' && results && results[0]) {
          const place = results[0]
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          
          if (map) {
            map.setCenter({ lat, lng })
            map.setZoom(15)
          }

          if (marker) {
            marker.setPosition({ lat, lng })
          } else if (map) {
            const newMarker = new google.maps.Marker({
              position: { lat, lng },
              map: map,
              draggable: true,
            })
            setMarker(newMarker)
          }

          onLocationSelect(place.formatted_address, lat, lng)
        }
      })
    } catch (error) {
      setIsLoading(false)
      console.error('Error searching location:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          size="sm"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border"
      />
      
      <p className="text-sm text-gray-500">
        Drag the marker to adjust your exact location, or search for an address above.
      </p>
    </div>
  )
}
