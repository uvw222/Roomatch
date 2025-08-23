import { notFound } from "next/navigation"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"
import GoogleMap from "@/components/GoogleMap"

type ProfileType = {
  _id: string
  name: string
  bio: string
  profileImage: string
  occupation: string
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  budget: number
  views: number
}

export default async function ProfilePage(props: { params: { id: string } }) {
  const { id } = props.params;
  await connectToDatabase()
  await Profile.findByIdAndUpdate(id, { $inc: { views: 1 } })
  const rawProfile = await Profile.findById(id).lean()


  if (!rawProfile) return notFound()

  // ✅ Safely cast only after confirming it exists
  const profile = rawProfile as unknown as ProfileType
console.log(" Profile views (after update):", profile.views)
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
      <p className="mb-4">{profile.bio || "No bio available"}</p>
      <img src={profile.profileImage || "/placeholder.svg"} alt={profile.name} className="rounded-md mb-4 w-60" />
      <p>Occupation: {profile.occupation}</p>
      <p>Location: {profile.location}</p>
      <p>Budget: ${profile.budget}</p>
      
      {profile.coordinates && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Location</h3>
          <GoogleMap 
            latitude={profile.coordinates.latitude}
            longitude={profile.coordinates.longitude}
            height="300px"
            className="mb-4"
          />
        </div>
      )}
    </div>
  )
}
