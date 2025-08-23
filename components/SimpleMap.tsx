"use client"

interface SimpleMapProps {
  latitude: number
  longitude: number
  height?: string
  width?: string
  className?: string
}

export default function SimpleMap({ 
  latitude, 
  longitude, 
  height = "300px", 
  width = "100%",
  className = ""
}: SimpleMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.005},${latitude-0.005},${longitude+0.005},${latitude+0.005}&layer=mapnik&marker=${latitude},${longitude}&zoom=18`

  return (
    <div 
      style={{ height, width }} 
      className={`rounded-lg border overflow-hidden ${className}`}
    >
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        title="Location Map"
      />
    </div>
  )
}
