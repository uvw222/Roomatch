"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, User, Save, ArrowLeft, Camera, MapPin, Briefcase, Calendar, FileText, Home, DollarSign, Clock, Shield, Settings, Plus, Image as ImageIcon } from "lucide-react"
import LocationPicker from "@/components/LocationPicker"
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
  galleryImages?: string[]
  userType?: string
  budget?: number
  // Renter-specific fields
  renterInfo?: {
    currentLivingSituation?: string
    reasonForMoving?: string
    employmentStatus?: string
    monthlyIncome?: number
    hasGuarantor?: boolean
    guarantorInfo?: string
    moveInTimeframe?: string
    leaseDuration?: string
    housingPreferences?: {
      roomType?: string
      bathroomType?: string
      furnished?: string
      utilities?: string[]
      amenities?: string[]
      accessibility?: string[]
    }
  }
  // Landlord-specific fields
  landlordInfo?: {
    propertyType?: string
    propertySize?: string
    availableRooms?: number
    totalRooms?: number
    monthlyRent?: number
    securityDeposit?: number
    utilitiesIncluded?: string[]
    furnished?: string
    leaseDuration?: string
    availableFrom?: string
    propertyAmenities?: string[]
    houseRules?: {
      smokingAllowed?: boolean
      petsAllowed?: boolean
      guestsAllowed?: boolean
      partiesAllowed?: boolean
      quietHours?: string
    }
    tenantPreferences?: {
      preferredAge?: string
      preferredGender?: string
      preferredOccupation?: string
      backgroundCheckRequired?: boolean
      creditCheckRequired?: boolean
      referencesRequired?: boolean
    }
  }
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
    galleryImages: [],
    userType: "",
    budget: 0,
    renterInfo: {
      currentLivingSituation: "",
      reasonForMoving: "",
      employmentStatus: "",
      monthlyIncome: 0,
      hasGuarantor: false,
      guarantorInfo: "",
      moveInTimeframe: "",
      leaseDuration: "",
      housingPreferences: {
        roomType: "",
        bathroomType: "",
        furnished: "",
        utilities: [],
        amenities: [],
        accessibility: []
      }
    },
    landlordInfo: {
      propertyType: "",
      propertySize: "",
      availableRooms: 0,
      totalRooms: 0,
      monthlyRent: 0,
      securityDeposit: 0,
      utilitiesIncluded: [],
      furnished: "",
      leaseDuration: "",
      availableFrom: "",
      propertyAmenities: [],
      houseRules: {
        smokingAllowed: false,
        petsAllowed: false,
        guestsAllowed: true,
        partiesAllowed: false,
        quietHours: ""
      },
      tenantPreferences: {
        preferredAge: "",
        preferredGender: "",
        preferredOccupation: "",
        backgroundCheckRequired: false,
        creditCheckRequired: false,
        referencesRequired: false
      }
    }
  })
  const [isNewUser, setIsNewUser] = useState(false)

  const [newImage, setNewImage] = useState<File | null>(null)
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([])
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
          galleryImages: (globalProfile as any).galleryImages ?? [],
          userType: globalProfile.userType ?? "",
          budget: globalProfile.budget ?? 0,
          renterInfo: globalProfile.renterInfo || {
            currentLivingSituation: "",
            reasonForMoving: "",
            employmentStatus: "",
            monthlyIncome: 0,
            hasGuarantor: false,
            guarantorInfo: "",
            moveInTimeframe: "",
            leaseDuration: "",
            housingPreferences: {
              roomType: "",
              bathroomType: "",
              furnished: "",
              utilities: [],
              amenities: [],
              accessibility: []
            }
          },
          landlordInfo: globalProfile.landlordInfo || {
            propertyType: "",
            propertySize: "",
            availableRooms: 0,
            totalRooms: 0,
            monthlyRent: 0,
            securityDeposit: 0,
            utilitiesIncluded: [],
            furnished: "",
            leaseDuration: "",
            availableFrom: "",
            propertyAmenities: [],
            houseRules: {
              smokingAllowed: false,
              petsAllowed: false,
              guestsAllowed: true,
              partiesAllowed: false,
              quietHours: ""
            },
            tenantPreferences: {
              preferredAge: "",
              preferredGender: "",
              preferredOccupation: "",
              backgroundCheckRequired: false,
              creditCheckRequired: false,
              referencesRequired: false
            }
          }
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
    }
  }

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setNewGalleryImages(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeImage = () => {
    setNewImage(null)
  }

  const removeGalleryImage = (index: number) => {
    setNewGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingGalleryImage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index) || []
    }))
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

      // Add profile image if available
      if (newImage) {
        formData.append("profileImage", newImage)
      }

      // Add gallery images (files) - same logic as profile image
      newGalleryImages.forEach((file, index) => {
        formData.append(`galleryImage_${index}`, file)
      })
      formData.append("galleryImageCount", String(newGalleryImages.length))

      const res = await fetch(`/api/profile/update`, {
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
      <div className="page-content flex items-center justify-center">
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
    <div className="page-content">
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
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-gray-500 transition-all duration-200">
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

        <div className="flex flex-col gap-8">
          {/* First Row: Profile Image + Basic Info (50/50) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Image Section - 50% width on web */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                  <Camera className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Profile Picture</CardTitle>
                  <CardDescription className="text-slate-600 text-sm">Upload your main photo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      newImage
                        ? URL.createObjectURL(newImage)
                        : profile.profileImage || "/placeholder.svg"
                    }
                    alt="Profile"
                    className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl object-cover mx-auto border-3 border-slate-200 shadow-lg"
                  />
                  {newImage && (
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-1.5 hover:from-red-600 hover:to-pink-600 shadow-lg transition-all duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                <div className="mt-4">
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleFileChange}
                    id="profile-image"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                    onClick={() => document.getElementById('profile-image')?.click()}
                    type="button"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information Section - 50% width on web */}
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
                  min="18"
                  max="120"
                  value={profile.age}
                  onChange={handleChange}
                  placeholder="Enter your age (18+)"
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
        </div>

        {/* Remaining Form Fields */}
        <div className="space-y-6">

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

            {/* Gallery Images Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Photo Gallery</CardTitle>
                    <CardDescription className="text-slate-600">Add more photos to showcase yourself</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Gallery Images */}
                {profile.galleryImages && profile.galleryImages.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">Current Photos</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {profile.galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-slate-200"
                          />
                          <button
                            onClick={() => removeExistingGalleryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Gallery Images Preview */}
                {newGalleryImages.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">New Photos to Add</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {newGalleryImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border-2 border-orange-200"
                          />
                          <button
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Gallery Images Button */}
                <div>
                  <Input 
                    type="file" 
                    accept="image/*"
                    multiple
                    className="hidden" 
                    onChange={handleGalleryFileChange}
                    id="gallery-images"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                    onClick={() => document.getElementById('gallery-images')?.click()}
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Photos to Gallery
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">You can select multiple images at once</p>
                </div>
              </CardContent>
            </Card>

            {/* Budget Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Budget</CardTitle>
                    <CardDescription className="text-slate-600">
                      {profile.userType === 'renter' ? 'Your monthly budget for housing' : 'Your monthly rent price'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="budget" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {profile.userType === 'renter' ? 'Monthly Budget *' : 'Monthly Rent *'}
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={profile.budget}
                    onChange={handleChange}
                    placeholder={profile.userType === 'renter' ? 'Enter your monthly budget' : 'Enter monthly rent price'}
                    className={`mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 ${errors.budget ? "border-red-500" : ""}`}
                  />
                  {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Renter-Specific Fields */}
        {profile.userType === 'renter' && (
          <div className="grid gap-6 lg:grid-cols-2 mt-8">
            {/* Current Situation Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <Home className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Current Situation</CardTitle>
                    <CardDescription className="text-slate-600">Your current living situation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Current Living Situation</Label>
                  <Select value={profile.renterInfo?.currentLivingSituation} onValueChange={(value: string) => 
                    setProfile(prev => ({...prev, renterInfo: {...prev.renterInfo, currentLivingSituation: value}}))
                  }>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select your current situation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living_with_parents">Living with Parents</SelectItem>
                      <SelectItem value="shared_apartment">Shared Apartment</SelectItem>
                      <SelectItem value="own_apartment">Own Apartment</SelectItem>
                      <SelectItem value="dorm">Dorm/Student Housing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Employment Status</Label>
                  <Select value={profile.renterInfo?.employmentStatus} onValueChange={(value: string) => 
                    setProfile(prev => ({...prev, renterInfo: {...prev.renterInfo, employmentStatus: value}}))
                  }>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full-time Employee</SelectItem>
                      <SelectItem value="part_time">Part-time Employee</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="freelance">Freelancer</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="monthlyIncome" className="text-sm font-semibold text-slate-700">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={profile.renterInfo?.monthlyIncome || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev, 
                      renterInfo: {...prev.renterInfo, monthlyIncome: parseInt(e.target.value) || 0}
                    }))}
                    placeholder="Enter your monthly income"
                    className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Moving Plans Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Moving Plans</CardTitle>
                    <CardDescription className="text-slate-600">When and why you're moving</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Move-in Timeframe</Label>
                  <Select value={profile.renterInfo?.moveInTimeframe} onValueChange={(value: string) => 
                    setProfile(prev => ({...prev, renterInfo: {...prev.renterInfo, moveInTimeframe: value}}))
                  }>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="When do you want to move?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="within_month">Within a month</SelectItem>
                      <SelectItem value="1-3_months">1-3 months</SelectItem>
                      <SelectItem value="3-6_months">3-6 months</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Preferred Lease Duration</Label>
                  <Select value={profile.renterInfo?.leaseDuration} onValueChange={(value: string) => 
                    setProfile(prev => ({...prev, renterInfo: {...prev.renterInfo, leaseDuration: value}}))
                  }>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="How long do you want to stay?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_term">Short-term (1-6 months)</SelectItem>
                      <SelectItem value="6_months">6 months</SelectItem>
                      <SelectItem value="1_year">1 year</SelectItem>
                      <SelectItem value="long_term">Long-term (1+ years)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reasonForMoving" className="text-sm font-semibold text-slate-700">Reason for Moving</Label>
                  <Textarea
                    id="reasonForMoving"
                    value={profile.renterInfo?.reasonForMoving || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev, 
                      renterInfo: {...prev.renterInfo, reasonForMoving: e.target.value}
                    }))}
                    placeholder="Why are you looking to move?"
                    rows={3}
                    className="mt-2 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Landlord-Specific Fields */}
        {profile.userType === 'landlord' && (
          <div className="grid gap-6 lg:grid-cols-2 mt-8">
            {/* Property Details Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <Home className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Property Details</CardTitle>
                    <CardDescription className="text-slate-600">Information about your property</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Property Type</Label>
                  <Select value={profile.landlordInfo?.propertyType} onValueChange={(value: string) => 
                    setProfile(prev => ({...prev, landlordInfo: {...prev.landlordInfo, propertyType: value}}))
                  }>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="room_in_house">Room in House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availableRooms" className="text-sm font-semibold text-slate-700">Available Rooms</Label>
                    <Input
                      id="availableRooms"
                      type="number"
                      value={profile.landlordInfo?.availableRooms || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev, 
                        landlordInfo: {...prev.landlordInfo, availableRooms: parseInt(e.target.value) || 0}
                      }))}
                      placeholder="0"
                      className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalRooms" className="text-sm font-semibold text-slate-700">Total Rooms</Label>
                    <Input
                      id="totalRooms"
                      type="number"
                      value={profile.landlordInfo?.totalRooms || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev, 
                        landlordInfo: {...prev.landlordInfo, totalRooms: parseInt(e.target.value) || 0}
                      }))}
                      placeholder="0"
                      className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="securityDeposit" className="text-sm font-semibold text-slate-700">Security Deposit</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    value={profile.landlordInfo?.securityDeposit || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev, 
                      landlordInfo: {...prev.landlordInfo, securityDeposit: parseInt(e.target.value) || 0}
                    }))}
                    placeholder="Enter security deposit amount"
                    className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tenant Preferences Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Tenant Preferences</CardTitle>
                    <CardDescription className="text-slate-600">What you're looking for in tenants</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Preferred Age Range</Label>
                  <Select value={profile.landlordInfo?.tenantPreferences?.preferredAge} onValueChange={(value: string) => 
                    setProfile(prev => ({
                      ...prev, 
                      landlordInfo: {
                        ...prev.landlordInfo, 
                        tenantPreferences: {...prev.landlordInfo?.tenantPreferences, preferredAge: value}
                      }
                    }))
                  }>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select preferred age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-45">36-45</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                      <SelectItem value="no_preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Preferred Gender</Label>
                  <Select value={profile.landlordInfo?.tenantPreferences?.preferredGender} onValueChange={(value: string) => 
                    setProfile(prev => ({
                      ...prev, 
                      landlordInfo: {
                        ...prev.landlordInfo, 
                        tenantPreferences: {...prev.landlordInfo?.tenantPreferences, preferredGender: value}
                      }
                    }))
                  }>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select preferred gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="no_preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Requirements</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="backgroundCheck"
                        checked={profile.landlordInfo?.tenantPreferences?.backgroundCheckRequired}
                        onCheckedChange={(checked: boolean) => setProfile(prev => ({
                          ...prev, 
                          landlordInfo: {
                            ...prev.landlordInfo, 
                            tenantPreferences: {...prev.landlordInfo?.tenantPreferences, backgroundCheckRequired: !!checked}
                          }
                        }))}
                      />
                      <Label htmlFor="backgroundCheck" className="text-sm">Background Check Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="creditCheck"
                        checked={profile.landlordInfo?.tenantPreferences?.creditCheckRequired}
                        onCheckedChange={(checked: boolean) => setProfile(prev => ({
                          ...prev, 
                          landlordInfo: {
                            ...prev.landlordInfo, 
                            tenantPreferences: {...prev.landlordInfo?.tenantPreferences, creditCheckRequired: !!checked}
                          }
                        }))}
                      />
                      <Label htmlFor="creditCheck" className="text-sm">Credit Check Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="references"
                        checked={profile.landlordInfo?.tenantPreferences?.referencesRequired}
                        onCheckedChange={(checked: boolean) => setProfile(prev => ({
                          ...prev, 
                          landlordInfo: {
                            ...prev.landlordInfo, 
                            tenantPreferences: {...prev.landlordInfo?.tenantPreferences, referencesRequired: !!checked}
                          }
                        }))}
                      />
                      <Label htmlFor="references" className="text-sm">References Required</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
