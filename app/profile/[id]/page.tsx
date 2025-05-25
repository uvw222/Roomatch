import { notFound } from "next/navigation"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"

type ProfileType = {
  _id: string
  name: string
  bio: string
  profileImage: string
  occupation: string
  location: string
  budget: number
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  await connectToDatabase()

  const rawProfile = await Profile.findById(params.id).lean()

  if (!rawProfile) return notFound()

  // ✅ Safely cast only after confirming it exists
  const profile = rawProfile as unknown as ProfileType

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
      <p className="mb-4">{profile.bio || "No bio available"}</p>
      <img src={profile.profileImage || "/placeholder.svg"} alt={profile.name} className="rounded-md mb-4 w-60" />
      <p>Occupation: {profile.occupation}</p>
      <p>Location: {profile.location}</p>
      <p>Budget: ${profile.budget}</p>
    </div>
  )
}
