"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Crop, Upload, X } from "lucide-react"
import LocationPicker from "@/components/LocationPicker"
import ImageCropper from "@/components/ImageCropper"
import { useProfile } from "../../../hooks/useProfile"

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
  const { profile: globalProfile, isLoading: profileLoading } = useProfile()
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: 0,
    occupation: "",
    location: "",
    coordinates: undefined,
    bio: "",
    profileImage: "",
  })
  const [isNewUser, setIsNewUser] = useState(false)

  const [newImage, setNewImage] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<File | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const { refreshProfile } = useProfile()

  useEffect(() => {
    if (!profileLoading) {
      if (globalProfile && globalProfile.name) {
        // Existing user with profile data
        setIsNewUser(false)
        setProfile({
          name: globalProfile.name ?? "",
          age: globalProfile.age ?? 0,
          occupation: globalProfile.occupation ?? "",
          location: globalProfile.location ?? "",
          coordinates: globalProfile.coordinates,
          bio: globalProfile.bio ?? "",
          profileImage: globalProfile.profileImage ?? "",
        })
        
        // If existing user doesn't have location, add current location
        if (!globalProfile.location) {
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
      } else {
        // New user - start with empty profile and current location
        setIsNewUser(true)
        setProfile({
          name: "",
          age: 0,
          occupation: "",
          location: "",
          coordinates: undefined,
          bio: "",
          profileImage: "",
        })
        
        // Set current location for new users
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
    }
  }, [globalProfile, profileLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImage(file)
      setCroppedImage(null) // Reset cropped image when new file is selected
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    setCroppedImage(croppedFile)
    setNewImage(null) // Clear the original file
  }

  const removeImage = () => {
    setNewImage(null)
    setCroppedImage(null)
  }

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {}

    // Enhanced validation with specific messages
    if (!profile.name.trim()) {
      newErrors.name = "Name is required"
    } else if (profile.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    } else if (profile.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters"
    }

    if (!profile.age || Number(profile.age) <= 0) {
      newErrors.age = "Age must be greater than 0"
    } else if (Number(profile.age) < 18) {
      newErrors.age = "You must be at least 18 years old"
    } else if (Number(profile.age) > 120) {
      newErrors.age = "Please enter a valid age"
    }

    if (!profile.occupation.trim()) {
      newErrors.occupation = "Occupation is required"
    } else if (profile.occupation.trim().length < 2) {
      newErrors.occupation = "Occupation must be at least 2 characters long"
    }

    if (!profile.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!profile.bio.trim()) {
      newErrors.bio = "Bio is required"
    } else if (profile.bio.trim().length < 10) {
      newErrors.bio = "Bio must be at least 10 characters long"
    } else if (profile.bio.trim().length > 500) {
      newErrors.bio = "Bio must be less than 500 characters"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", profile.name.trim())
      formData.append("age", String(profile.age))
      formData.append("occupation", profile.occupation.trim())
      formData.append("location", profile.location.trim())
      formData.append("bio", profile.bio.trim())

      if (profile.coordinates) {
        formData.append("latitude", String(profile.coordinates.latitude))
        formData.append("longitude", String(profile.coordinates.longitude))
      }

      // Use cropped image if available, otherwise use new image
      if (croppedImage) {
        formData.append("profileImage", croppedImage)
      } else if (newImage) {
        formData.append("profileImage", newImage)
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await res.json()
      if (data.success) {
        setSuccessMessage("Profile updated successfully!")
        // Refresh the profile image in the header
        refreshProfile()
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setErrors({ submit: data.message || "Error updating profile" })
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {isNewUser ? "Complete Your Profile" : "Edit Your Profile"}
      </h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      {/* Profile Image Section */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-2 block">Profile Picture</Label>
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img
              src={
                croppedImage
                  ? URL.createObjectURL(croppedImage)
                  : newImage
                  ? URL.createObjectURL(newImage)
                  : profile.profileImage || "/placeholder.svg"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mx-auto border"
            />
            {(newImage || croppedImage) && (
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 justify-center">
            <Input 
              type="file" 
              accept="image/*" 
              className="max-w-xs" 
              onChange={handleFileChange}
              id="profile-image"
            />
            <Label htmlFor="profile-image" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </span>
              </Button>
            </Label>
          </div>

          {newImage && (
            <ImageCropper
              imageFile={newImage}
              onCropComplete={handleCropComplete}
              aspectRatio={1}
              trigger={
                <Button variant="outline" size="sm">
                  <Crop className="h-4 w-4 mr-2" />
                  Crop Image
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="age" className="text-sm font-medium">Age *</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={profile.age}
            onChange={handleChange}
            placeholder="Enter your age"
            className={errors.age ? "border-red-500" : ""}
          />
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>

        <div>
          <Label htmlFor="occupation" className="text-sm font-medium">Occupation *</Label>
          <Input
            id="occupation"
            name="occupation"
            value={profile.occupation}
            onChange={handleChange}
            placeholder="Enter your occupation"
            className={errors.occupation ? "border-red-500" : ""}
          />
          {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium">Location *</Label>
          {profile.location && (
            <p className="text-sm text-gray-600 mb-2">
              Current location: {profile.location}
              {profile.coordinates && (
                <span className="block text-xs text-gray-500">
                  Coordinates: {profile.coordinates.latitude.toFixed(6)}, {profile.coordinates.longitude.toFixed(6)}
                </span>
              )}
            </p>
          )}
          <LocationPicker
            onLocationSelect={(location: string, latitude: number, longitude: number) => {
              console.log('LocationPicker selected:', { location, latitude, longitude })
              setProfile(prev => ({
                ...prev,
                location,
                coordinates: { latitude, longitude }
              }))
              // Clear location error when location is selected
              if (errors.location) {
                setErrors(prev => ({ ...prev, location: "" }))
              }
            }}
            initialLocation={profile.location}
            initialLatitude={profile.coordinates?.latitude}
            initialLongitude={profile.coordinates?.longitude}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>

        <div>
          <Label htmlFor="bio" className="text-sm font-medium">Bio *</Label>
          <Textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
            className={errors.bio ? "border-red-500" : ""}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
            <p className="text-gray-500 text-sm ml-auto">
              {profile.bio.length}/500
            </p>
          </div>
        </div>

        <Button 
          className="w-full mt-6" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
