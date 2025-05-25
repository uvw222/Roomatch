"use client"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Profile = {
  name: string
  age: number
  occupation: string
  location: string
  bio: string
  profileImage?: string
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: 0,
    occupation: "",
    location: "",
    bio: "",
    profileImage: "",
  })

  const [newImage, setNewImage] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/profile/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.profile)
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
    const formData = new FormData()
    formData.append("name", profile.name)
    formData.append("age", profile.age.toString())
    formData.append("occupation", profile.occupation)
    formData.append("location", profile.location)
    formData.append("bio", profile.bio)
    if (newImage) {
      formData.append("profileImage", newImage)
    }

    const res = await fetch("/api/profile/update", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (data.success) {
      router.push("/dashboard") // Or show a toast
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
          alt="Profile Preview"
          className="w-32 h-32 rounded-full object-cover mx-auto border"
        />
        <Input type="file" accept="image/*" className="mt-2" onChange={handleFileChange} />
      </div>

      {/* Other Inputs */}
      <div className="space-y-4">
        <Input name="name" value={profile.name} onChange={handleChange} placeholder="Name" />
        <Input name="age" type="number" value={profile.age} onChange={handleChange} placeholder="Age" />
        <Input name="occupation" value={profile.occupation} onChange={handleChange} placeholder="Occupation" />
        <Input name="location" value={profile.location} onChange={handleChange} placeholder="Location" />
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
