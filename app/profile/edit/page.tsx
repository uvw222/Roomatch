"use client"
import { useEffect } from "react"
import type React from "react"
import Cookies from "js-cookie"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Upload } from "lucide-react"

export default function EditProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const email = Cookies.get("userEmail")
  const [formData, setFormData] = useState({
  name: "Alex Johnson",
  age: 25,
  gender: "male",
  occupation: "Software Developer",
  bio: "I'm a clean, quiet professional looking for a roommate with similar habits. I enjoy cooking and occasional movie nights.",
  budget: 1200,
  moveInDate: "2023-06-15",
  location: "Downtown",
  hasPets: false,
  isSmoker: false,
  profileImage: "",         
  profileImageFile: null as File | null,
  lifestyle: {
    cleanliness: 80,
    noise: 40,
    guestsFrequency: 50,
    sleepSchedule: "night-owl",
  },
  preferences: {
    ageRange: [20, 35],
    genderPreference: "any",
    petsAllowed: true,
    smokingAllowed: false,
  },
})

useEffect(() => {
  const fetchProfile = async () => {
    const email = Cookies.get("userEmail")
    if (!email) return

    try {
      const res = await fetch(`/api/get-profile?email=${email}`)
      const data = await res.json()

      if (res.ok && data.success) {
        setFormData((prev) => ({
          ...prev,
          ...data.profile,
        }))
      } else {
        console.error("Profile not found")
      }
    } catch (err) {
      console.error("Failed to fetch profile", err)
    }
  }

  fetchProfile()
}, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      lifestyle: { ...prev.lifestyle, [name]: value[0] },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
const email = Cookies.get("userEmail")
if (!email) {
  alert("Could not find user identity. Please log in again.")
  setIsLoading(false)
  return
}

const response = await fetch("/api/save-profile", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ...formData, email }), // 👈 include email
})


    const result = await response.json()

    if (result.success) {
      router.push("/dashboard")
    } else {
      console.error("Failed to save profile")
    }
  } catch (error) {
    console.error("Error submitting form:", error)
  } finally {
    setIsLoading(false)
  }
}


  return (
    <div className="container py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your personal information and profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative inline-block">
  <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 border">
    <img
      src={formData.profileImage || "/placeholder.svg?height=128&width=128&text=Profile"}
      alt="Profile"
      className="h-full w-full object-cover"
    />
  </div>
  <label
    htmlFor="profileImageUpload"
    className="absolute -top-2 -right-2 rounded-full bg-white shadow-md h-8 w-8 flex items-center justify-center cursor-pointer border"
  >
    <Upload className="h-4 w-4" />
    <input
      id="profileImageUpload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          profileImage: imageUrl,
          profileImageFile: file,
        }));
      }}
    />
  </label>
</div>

                      <p className="text-sm text-gray-500">Upload a profile photo</p>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => handleSelectChange("gender", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="non-binary">Non-binary</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Occupation</Label>
                          <Input
                            id="occupation"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      placeholder="Tell potential roommates about yourself..."
                      value={formData.bio}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Monthly Budget ($)</Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moveInDate">Move-in Date</Label>
                      <Input
                        id="moveInDate"
                        name="moveInDate"
                        type="date"
                        value={formData.moveInDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Preferred Location</Label>
                      <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lifestyle">
              <Card>
                <CardHeader>
                  <CardTitle>Lifestyle</CardTitle>
                  <CardDescription>Tell us about your living habits and lifestyle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Cleanliness Level</Label>
                        <span className="text-sm text-gray-500">{formData.lifestyle.cleanliness}%</span>
                      </div>
                      <Slider
                        defaultValue={[formData.lifestyle.cleanliness]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleSliderChange("cleanliness", value)}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Relaxed</span>
                        <span>Very Clean</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Noise Level</Label>
                        <span className="text-sm text-gray-500">{formData.lifestyle.noise}%</span>
                      </div>
                      <Slider
                        defaultValue={[formData.lifestyle.noise]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleSliderChange("noise", value)}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Very Quiet</span>
                        <span>Don't Mind Noise</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Guest Frequency</Label>
                        <span className="text-sm text-gray-500">{formData.lifestyle.guestsFrequency}%</span>
                      </div>
                      <Slider
                        defaultValue={[formData.lifestyle.guestsFrequency]}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleSliderChange("guestsFrequency", value)}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Rarely</span>
                        <span>Frequently</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sleepSchedule">Sleep Schedule</Label>
                      <Select
                        value={formData.lifestyle.sleepSchedule}
                        onValueChange={(value) => handleSelectChange("lifestyle.sleepSchedule", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sleep schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="early-bird">Early Bird (Before 10PM)</SelectItem>
                          <SelectItem value="average">Average (10PM - 12AM)</SelectItem>
                          <SelectItem value="night-owl">Night Owl (After 12AM)</SelectItem>
                          <SelectItem value="irregular">Irregular Schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hasPets">Do you have pets?</Label>
                        <p className="text-sm text-gray-500">Let others know if you have any pets</p>
                      </div>
                      <Switch
                        id="hasPets"
                        checked={formData.hasPets}
                        onCheckedChange={(checked) => handleSwitchChange("hasPets", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isSmoker">Do you smoke?</Label>
                        <p className="text-sm text-gray-500">Let others know if you smoke</p>
                      </div>
                      <Switch
                        id="isSmoker"
                        checked={formData.isSmoker}
                        onCheckedChange={(checked) => handleSwitchChange("isSmoker", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Roommate Preferences</CardTitle>
                  <CardDescription>Specify what you're looking for in a roommate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Age Range Preference</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={formData.preferences.ageRange[0]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              ageRange: [Number.parseInt(e.target.value), prev.preferences.ageRange[1]],
                            },
                          }))
                        }
                        className="w-24"
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        value={formData.preferences.ageRange[1]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              ageRange: [prev.preferences.ageRange[0], Number.parseInt(e.target.value)],
                            },
                          }))
                        }
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genderPreference">Gender Preference</Label>
                    <Select
                      value={formData.preferences.genderPreference}
                      onValueChange={(value) => handleSelectChange("preferences.genderPreference", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Gender</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="same">Same as Mine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="petsAllowed">Pets Allowed?</Label>
                        <p className="text-sm text-gray-500">Are you okay with a roommate who has pets?</p>
                      </div>
                      <Switch
                        id="petsAllowed"
                        checked={formData.preferences.petsAllowed}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              petsAllowed: checked,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="smokingAllowed">Smoking Allowed?</Label>
                        <p className="text-sm text-gray-500">Are you okay with a roommate who smokes?</p>
                      </div>
                      <Switch
                        id="smokingAllowed"
                        checked={formData.preferences.smokingAllowed}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              smokingAllowed: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
