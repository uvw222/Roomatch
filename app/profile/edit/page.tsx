"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crop, Upload, X, User, Save, ArrowLeft, Camera, MapPin, Briefcase, Calendar, FileText } from "lucide-react"
import LocationPicker from "@/components/LocationPicker"
import ImageCropper from "@/components/ImageCropper"
import { useProfile } from "../../../hooks/useProfile"
import Link from "next/link"

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-0 shadow-xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-600 font-medium">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {isNewUser ? "Complete Your Profile" : "Edit Your Profile"}
            </h1>
            <p className="text-slate-600 text-lg">
              {isNewUser ? "Tell us about yourself to get started" : "Update your profile information"}
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {successMessage}
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {errors.submit}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile Image Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                  <Camera className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">Profile Picture</CardTitle>
                  <CardDescription className="text-slate-600">Upload a photo to help others recognize you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
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
                    className="w-40 h-40 rounded-2xl object-cover mx-auto border-4 border-slate-200 shadow-lg"
                  />
                  {(newImage || croppedImage) && (
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-2 hover:from-red-600 hover:to-pink-600 shadow-lg transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex gap-3 justify-center mt-4">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="max-w-xs border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200" 
                    onChange={handleFileChange}
                    id="profile-image"
                  />
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </Label>
                </div>

                {newImage && (
                  <div className="mt-4">
                    <ImageCropper
                      imageFile={newImage}
                      onCropComplete={handleCropComplete}
                      aspectRatio={1}
                      trigger={
                        <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                          <Crop className="h-4 w-4 mr-2" />
                          Crop Image
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Basic Information Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Basic Information</CardTitle>
                    <CardDescription className="text-slate-600">Your personal details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Age *
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={profile.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                    className={`mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 ${errors.age ? "border-red-500" : ""}`}
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <Label htmlFor="occupation" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Occupation *
                  </Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={profile.occupation}
                    onChange={handleChange}
                    placeholder="Enter your occupation"
                    className={`mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 ${errors.occupation ? "border-red-500" : ""}`}
                  />
                  {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Location</CardTitle>
                    <CardDescription className="text-slate-600">Where you're located</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {profile.location && (
                  <div className="mb-4 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                    <p className="text-slate-700 font-medium">Current location: {profile.location}</p>
                    {profile.coordinates && (
                      <p className="text-xs text-slate-500 mt-1">
                        Coordinates: {profile.coordinates.latitude.toFixed(6)}, {profile.coordinates.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
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
                {errors.location && <p className="text-red-500 text-sm mt-2">{errors.location}</p>}
              </CardContent>
            </Card>

            {/* Bio Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">About You</CardTitle>
                    <CardDescription className="text-slate-600">Tell others about yourself</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">Bio *</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your interests, and what you're looking for in a roommate..."
                    rows={4}
                    className={`mt-2 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 ${errors.bio ? "border-red-500" : ""}`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                    <p className="text-slate-500 text-sm ml-auto">
                      {profile.bio.length}/500
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 h-12 text-lg font-semibold" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
