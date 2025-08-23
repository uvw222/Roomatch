"use client"

import { useProfile } from "../../../hooks/useProfile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, User, Edit, Calendar, Briefcase } from "lucide-react"
import Link from "next/link"
import SmartMap from "@/components/SmartMap"

export default function MyProfilePage() {
  const { profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="container py-10 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container py-10 px-4">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <Link href="/profile/edit">
            <Button>Create Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            <p className="text-gray-600">Your Profile</p>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Image */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <img
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{profile.age} years old</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.occupation}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || "No bio available"}
                </p>
              </CardContent>
            </Card>

            {/* Location Map */}
            {profile.coordinates && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    My Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{profile.location}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      Coordinates: {profile.coordinates.latitude}, {profile.coordinates.longitude}
                    </div>
                    <SmartMap 
                      latitude={profile.coordinates.latitude}
                      longitude={profile.coordinates.longitude}
                      height="300px"
                      className="rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {profile.views || 0}
                    </div>
                    <div className="text-sm text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {profile.likedProfiles?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">People You've Liked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
