"use client"

import { useEffect, useRef, useState, memo } from 'react'
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

const LocationPicker = memo(function LocationPicker({ 
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

  // Update search query when initial location changes
  useEffect(() => {
    if (initialLocation && initialLocation !== searchQuery) {

      setSearchQuery(initialLocation)
    }
  }, [initialLocation])

  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log('LocationPicker: Initializing with:', { 
          initialLocation, 
          initialLatitude, 
          initialLongitude 
        })
        
        await loadGoogleMapsScript()
        
        if (!mapRef.current || !searchInputRef.current) return

        // Initialize map
        const defaultPosition = initialLatitude && initialLongitude 
          ? { lat: initialLatitude, lng: initialLongitude }
          : { lat: 40.7128, lng: -74.0060 } // Default to NYC

        console.log('LocationPicker: Map center position:', defaultPosition)

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

        // Function to add drag listener to marker
        const addDragListener = (markerInstance: google.maps.Marker) => {
          markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition()
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

        // Add marker if initial coordinates exist
        let currentMarker: google.maps.Marker | null = null
        if (initialLatitude && initialLongitude) {

          currentMarker = new google.maps.Marker({
            position: { lat: initialLatitude, lng: initialLongitude },
            map: newMap,
            draggable: true,
          })
          addDragListener(currentMarker)
          setMarker(currentMarker)
        }

        // Handle place selection
        newAutocomplete.addListener('place_changed', () => {
          const place = newAutocomplete.getPlace()
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            const address = place.formatted_address || searchQuery
            
            // Update search query state to match the selected place
            setSearchQuery(address)
            
            newMap.setCenter({ lat, lng })
            newMap.setZoom(18)

            // Update or create marker
            if (currentMarker) {
              currentMarker.setPosition({ lat, lng })
            } else {
              currentMarker = new google.maps.Marker({
                position: { lat, lng },
                map: newMap,
                draggable: true,
              })
              addDragListener(currentMarker)
              setMarker(currentMarker)
            }

            onLocationSelect(address, lat, lng)
          }
        })

        setMap(newMap)
        setAutocomplete(newAutocomplete)
      } catch (error) {
        console.error('Error initializing location picker:', error)
      }
    }

    initializeMap()
  }, [initialLatitude, initialLongitude, onLocationSelect])

  const handleSearch = async () => {
    // Get the current input value instead of using state
    const currentQuery = searchInputRef.current?.value || searchQuery
    if (!currentQuery.trim()) return
    

    setIsLoading(true)
    try {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: currentQuery }, (results, status) => {
        setIsLoading(false)
        if (status === 'OK' && results && results[0]) {
          const place = results[0]
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address
          

          
          // Update search query state to match the found location
          setSearchQuery(address)
          
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
            // Add drag listener to the new marker
            newMarker.addListener('dragend', () => {
              const position = newMarker.getPosition()
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
            setMarker(newMarker)
          }

          onLocationSelect(address, lat, lng)
        } else {
          // Handle geocoding errors
          console.error('Geocoding failed:', status)
          alert(`Could not find location: "${currentQuery}". Please try a different search term.`)
        }
      })
    } catch (error) {
      setIsLoading(false)
      console.error('Error searching location:', error)
      alert('Error searching for location. Please try again.')
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
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
})

export default LocationPicker
