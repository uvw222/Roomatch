"use client"

interface OpenStreetMapProps {
  latitude: number
  longitude: number
  zoom?: number
  height?: string
  width?: string
  className?: string
}

export default function OpenStreetMap({ 
  latitude, 
  longitude, 
  zoom = 15, 
  height = "300px", 
  width = "100%",
  className = ""
}: OpenStreetMapProps) {
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
  
  // Create OpenStreetMap URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <iframe
        src={mapUrl}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg border"
        frameBorder="0"
        title="Location Map"
      />
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 px-2 py-1 rounded text-xs text-gray-600">
        <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
      </div>
    </div>
  )
}
