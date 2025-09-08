"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Mail, 
  Smartphone,
  Save,
  ArrowLeft,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

interface UserSettings {
  // Profile Settings
  name: string
  email: string
  phone: string
  
  // Privacy Settings
  profileVisibility: "public" | "friends" | "private"
  showLocation: boolean
  showAge: boolean
  showOccupation: boolean
  
  // Notification Settings
  emailNotifications: boolean
  pushNotifications: boolean
  matchNotifications: boolean
  messageNotifications: boolean
  meetingReminders: boolean
  
  // App Preferences
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  
  // Account Settings
  emailUpdates: boolean
  marketingEmails: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    // Profile Settings
    name: "",
    email: "",
    phone: "",
    
    // Privacy Settings
    profileVisibility: "public",
    showLocation: true,
    showAge: true,
    showOccupation: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    meetingReminders: true,
    
    // App Preferences
    theme: "system",
    language: "en",
    timezone: "UTC",
    
    // Account Settings
    emailUpdates: true,
    marketingEmails: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load user settings from API
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`)
        const data = await res.json()
        
        if (data.success && data.profile) {
          setSettings(prev => ({
            ...prev,
            name: data.profile.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
          }))
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save settings to API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: settings.name,
          phone: settings.phone,
          // Add other settings as needed
        }),
      })

      if (res.ok) {
        // Show success message
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-0 shadow-xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-600 font-medium">Loading settings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-orange-600" />
              </div>
              Settings
            </h1>
            <p className="text-slate-600 text-lg">Manage your account preferences and privacy</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-gray-500 transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-slate-200 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200">
              <Mail className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Profile Information</CardTitle>
                    <CardDescription className="text-slate-600">Update your personal information and contact details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      value={settings.email}
                      disabled
                      className="mt-2 h-12 bg-slate-50 border-slate-200 text-slate-500"
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Privacy & Visibility</CardTitle>
                    <CardDescription className="text-slate-600">Control who can see your profile information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="visibility" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Profile Visibility
                  </Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) => handleChange("profileVisibility", value)}
                  >
                    <SelectTrigger className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                      <SelectItem value="public">Public - Anyone can see my profile</SelectItem>
                      <SelectItem value="friends">Friends Only - Only matched users can see my profile</SelectItem>
                      <SelectItem value="private">Private - Only I can see my profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Profile Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Show Location</Label>
                        <p className="text-sm text-slate-500">Display your location on your profile</p>
                      </div>
                      <Switch
                        checked={settings.showLocation}
                        onCheckedChange={(checked) => handleChange("showLocation", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Show Age</Label>
                        <p className="text-sm text-slate-500">Display your age on your profile</p>
                      </div>
                      <Switch
                        checked={settings.showAge}
                        onCheckedChange={(checked) => handleChange("showAge", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Show Occupation</Label>
                        <p className="text-sm text-slate-500">Display your occupation on your profile</p>
                      </div>
                      <Switch
                        checked={settings.showOccupation}
                        onCheckedChange={(checked) => handleChange("showOccupation", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Notification Preferences</CardTitle>
                    <CardDescription className="text-slate-600">Choose how and when you want to be notified</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    General Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Push Notifications</Label>
                        <p className="text-sm text-slate-500">Receive notifications on your device</p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleChange("pushNotifications", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Specific Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">New Matches</Label>
                        <p className="text-sm text-slate-500">When someone matches with you</p>
                      </div>
                      <Switch
                        checked={settings.matchNotifications}
                        onCheckedChange={(checked) => handleChange("matchNotifications", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">New Messages</Label>
                        <p className="text-sm text-slate-500">When you receive a new message</p>
                      </div>
                      <Switch
                        checked={settings.messageNotifications}
                        onCheckedChange={(checked) => handleChange("messageNotifications", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Meeting Reminders</Label>
                        <p className="text-sm text-slate-500">Reminders for scheduled meetings</p>
                      </div>
                      <Switch
                        checked={settings.meetingReminders}
                        onCheckedChange={(checked) => handleChange("meetingReminders", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <Palette className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">App Preferences</CardTitle>
                    <CardDescription className="text-slate-600">Customize your app experience</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="theme" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Theme
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Select
                        value={settings.theme}
                        onValueChange={(value) => handleChange("theme", value)}
                      >
                        <SelectTrigger className="h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      <ThemeToggle />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="language" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Language
                    </Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleChange("language", value)}
                    >
                      <SelectTrigger className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Timezone
                    </Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => handleChange("timezone", value)}
                    >
                      <SelectTrigger className="mt-2 h-12 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg">
                    <Mail className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Account & Email Preferences</CardTitle>
                    <CardDescription className="text-slate-600">Manage your account settings and email preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Preferences
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Account Updates</Label>
                        <p className="text-sm text-slate-500">Important updates about your account</p>
                      </div>
                      <Switch
                        checked={settings.emailUpdates}
                        onCheckedChange={(checked) => handleChange("emailUpdates", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div>
                        <Label className="font-medium text-slate-700">Marketing Emails</Label>
                        <p className="text-sm text-slate-500">Promotional emails and offers</p>
                      </div>
                      <Switch
                        checked={settings.marketingEmails}
                        onCheckedChange={(checked) => handleChange("marketingEmails", checked)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Account Actions
                  </h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 h-12 text-lg font-semibold"
          >
            {isSaving ? (
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
    </div>
  )
}
