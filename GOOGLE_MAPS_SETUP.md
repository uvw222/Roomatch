# Google Maps Integration Setup

This project now includes location and map functionality for user profiles. Currently, it uses a simple map implementation, but you can upgrade to full Google Maps functionality.

## Current Implementation

The app currently uses:
- **Simple Map**: OpenStreetMap integration (no API key required)
- **Simple Location Picker**: Manual coordinate input with geolocation support

## Upgrading to Full Google Maps

To use the full Google Maps functionality with interactive maps and location search:

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Add Environment Variable

Add your Google Maps API key to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Switch to Full Google Maps Components

Replace the simple components with the full Google Maps versions:

#### In `app/profile/[id]/page.tsx`:
```tsx
// Replace this import:
import SimpleMap from "@/components/SimpleMap"
// With this:
import GoogleMap from "@/components/GoogleMap"

// And update the component usage:
<GoogleMap 
  latitude={profile.coordinates.latitude}
  longitude={profile.coordinates.longitude}
  height="300px"
  className="mb-4"
/>
```

#### In `app/profile/edit/page.tsx`:
```tsx
// Replace this import:
import SimpleLocationPicker from "@/components/SimpleLocationPicker"
// With this:
import LocationPicker from "@/components/LocationPicker"

// And update the component usage:
<LocationPicker
  onLocationSelect={(location: string, latitude: number, longitude: number) => {
    setProfile(prev => ({
      ...prev,
      location,
      coordinates: { latitude, longitude }
    }))
  }}
  initialLocation={profile.location}
  initialLatitude={profile.coordinates?.latitude}
  initialLongitude={profile.coordinates?.longitude}
/>
```

## Features

### Current Features (Simple Implementation)
- ✅ Display location on profile pages using OpenStreetMap
- ✅ Manual coordinate input
- ✅ Current location detection using browser geolocation
- ✅ Reverse geocoding to get address from coordinates
- ✅ Location storage in database

### Full Google Maps Features (After Setup)
- ✅ Interactive Google Maps with zoom and pan
- ✅ Location search with autocomplete
- ✅ Draggable markers for precise location selection
- ✅ Address autocomplete and validation
- ✅ Street view integration
- ✅ Custom map styling

## Database Schema

The Profile model now includes coordinates:

```typescript
coordinates: {
  latitude: Number,
  longitude: Number,
}
```

## Usage

1. **Viewing Profiles**: Maps automatically display when coordinates are available
2. **Editing Profiles**: Use the location picker to set your location
3. **Current Location**: Click "Use Current Location" to automatically detect your position
4. **Manual Input**: Enter coordinates manually if needed

## Cost Considerations

- **Simple Implementation**: Free (OpenStreetMap)
- **Google Maps**: Pay-per-use after free tier (typically $200/month free credit)

## Security Notes

- Always restrict your Google Maps API key to your domain
- Never expose API keys in client-side code (use environment variables)
- Consider implementing rate limiting for location services
