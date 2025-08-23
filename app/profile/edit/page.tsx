"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import LocationPicker from "@/components/LocationPicker"

type Profile = {
  name: string
  age: number
  occupation: string
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  bio: string
  profileImage?: string
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: 0,
    occupation: "",
    location: "",
    coordinates: undefined,
    bio: "",
    profileImage: "",
  })

  const [newImage, setNewImage] = useState<File | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setProfile({
            name: data.profile.name ?? "",
            age: data.profile.age ?? 0,
            occupation: data.profile.occupation ?? "",
            location: data.profile.location ?? "",
            coordinates: data.profile.coordinates,
            bio: data.profile.bio ?? "",
            profileImage: data.profile.profileImage ?? "",
          })
        }
        
        // If no location is set, try to use detected location
        if (!data.profile?.location) {
          const storedLocation = localStorage.getItem('userLocation')
          if (storedLocation) {
            try {
              const locationData = JSON.parse(storedLocation)
              setProfile(prev => ({
                ...prev,
                location: locationData.location,
                coordinates: {
                  latitude: locationData.latitude,
                  longitude: locationData.longitude
                }
              }))
            } catch (error) {
              console.error('Error parsing stored location:', error)
            }
          }
        }
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImage(file)
    }
  }

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {}

    if (!profile.name.trim()) newErrors.name = "Name is required"
    if (!profile.age || Number(profile.age) <= 0) newErrors.age = "Age must be greater than 0"
    if (!profile.location.trim()) newErrors.location = "Location is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    const formData = new FormData()
    formData.append("name", profile.name)
    formData.append("age", String(profile.age))
    formData.append("occupation", profile.occupation)
    formData.append("location", profile.location)
    formData.append("bio", profile.bio)

    if (profile.coordinates) {
      formData.append("latitude", String(profile.coordinates.latitude))
      formData.append("longitude", String(profile.coordinates.longitude))
    }

    if (newImage) {
      formData.append("profileImage", newImage)
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    const data = await res.json()
    if (data.success) {
      router.push("/dashboard")
    } else {
      alert("Error updating profile")
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>

      {/* Profile Image Preview */}
      <div className="mb-6 text-center">
        <img
          src={
            newImage
              ? URL.createObjectURL(newImage)
              : profile.profileImage || "/placeholder.svg"
          }
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover mx-auto border"
        />
        <Input type="file" accept="image/*" className="mt-2" onChange={handleFileChange} />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <Input
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Name"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <Input
          name="age"
          type="number"
          value={profile.age}
          onChange={handleChange}
          placeholder="Age"
        />
        {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

        <Input
          name="occupation"
          value={profile.occupation}
          onChange={handleChange}
          placeholder="Occupation"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
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
        </div>
        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}

        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full border p-2 rounded"
        />

        <Button className="w-full mt-4" onClick={handleSubmit}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
