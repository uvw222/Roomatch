"use client"

import { useProfile } from "../../../hooks/useProfile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, User, Edit, Calendar, Briefcase, Eye, Heart, Star, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import SmartMap from "@/components/SmartMap"

export default function MyProfilePage() {
  const { profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="page-content bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-0 shadow-xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-600 font-medium">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-content bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-0 shadow-xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-slate-800">Profile Not Found</h1>
          <p className="text-slate-600 mb-6">Unable to load your profile information.</p>
          <Link href="/profile/edit">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              Create Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {profile.name}
              </h1>
              <p className="text-slate-600 text-lg">Your Profile</p>
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Enhanced Profile Image Card */}
            <div className="md:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="relative">
                    <img
                      src={profile.profileImage || "/placeholder.svg"}
                      alt={profile.name}
                      className="w-full h-80 object-cover rounded-2xl mb-6 shadow-lg"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-700">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-slate-700 font-medium">{profile.age} years old</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-slate-700 font-medium">{profile.occupation}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{profile.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Profile Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Enhanced Bio */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">About Me</CardTitle>
                      <p className="text-slate-600 text-sm">Tell others about yourself</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed">
                      {profile.bio || "No bio available yet. Add one to help others get to know you better!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Location Map */}
              {profile.coordinates && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-800">My Location</CardTitle>
                        <p className="text-slate-600 text-sm">Where you're located</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-slate-700 font-medium">{profile.location}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Coordinates: {profile.coordinates.latitude}, {profile.coordinates.longitude}
                        </p>
                      </div>
                      <SmartMap 
                        latitude={profile.coordinates.latitude}
                        longitude={profile.coordinates.longitude}
                        height="300px"
                        className="rounded-xl shadow-lg"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Profile Stats */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">Profile Statistics</CardTitle>
                      <p className="text-slate-600 text-sm">Your profile performance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-800 mb-1">
                        {profile.views || 0}
                      </div>
                      <div className="text-sm text-slate-600">Profile Views</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-800 mb-1">
                        {profile.likedProfiles?.length || 0}
                      </div>
                      <div className="text-sm text-slate-600">People You've Liked</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-800 mb-1">
                        {profile.bio ? "Complete" : "Basic"}
                      </div>
                      <div className="text-sm text-slate-600">Profile Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completion Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">Profile Completion</CardTitle>
                      <p className="text-slate-600 text-sm">Complete your profile for better matches</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Profile Completeness</span>
                        <span className="font-semibold text-slate-800">70%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600">Basic Info</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600">Photo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-slate-600">Bio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-slate-600">Interests</span>
                      </div>
                    </div>
                    <Link href="/profile/edit">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                        <Edit className="h-4 w-4 mr-2" />
                        Complete Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
