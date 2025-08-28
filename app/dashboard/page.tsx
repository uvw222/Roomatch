import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Calendar, User, Home, Heart, TrendingUp, Users, Clock, ArrowRight, Plus, Edit3 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCollection } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getCurrentUser } from "@/lib/auth"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }

  const profiles = await getCollection("profiles")
  const profile = await profiles.findOne({ email: user.email })
  
  if (!profile) {
    redirect("/login") // just in case email is stale or user was deleted
  }
  const myIdString = profile._id.toString();          // convert my ObjectId to string
const likedObjectIds = (profile.likedProfiles || [])
  .map((id: string) => new ObjectId(id));           // convert my likes to ObjectIds

const mutualMatches = await profiles.find({
  likedProfiles: myIdString,                       // they liked me (stored as string)
  _id: { $in: likedObjectIds }                     // I liked them (converted to ObjectIds)
}).toArray();

const matchCount = mutualMatches.length
const messagesCol = await getCollection("messages")
const unreadCount = await messagesCol.countDocuments({ to: user.email, read: false })

console.log("Profile ID:", profile._id)
console.log("Liked profiles:", profile.likedProfiles)
console.log("Converted liked profiles:", likedObjectIds)
console.log("Match count:", mutualMatches.length)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Enhanced Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Welcome back, {profile.name}! 👋
                </h1>
                <p className="text-slate-600 text-lg">Here's what's happening with your roommate search</p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Active</span>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group">
              <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <CardTitle className="text-sm font-semibold text-slate-700">Profile Views</CardTitle>
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800 mb-1">{profile.views ?? 0}</div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +12% this week
                </p>
              </CardContent>
            </Card>

            <Link href="/matches">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                  <CardTitle className="text-sm font-semibold text-slate-700">Matches</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Heart className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{matchCount}</div>
                  <p className="text-xs text-slate-500">mutual connections</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/chat">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                  <CardTitle className="text-sm font-semibold text-slate-700">Messages</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{unreadCount}</div>
                  <p className="text-xs text-slate-500">unread messages</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/likes">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                  <CardTitle className="text-sm font-semibold text-slate-700">Likes</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Heart className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{profile.likedProfiles?.length || 0}</div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    People you've liked
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Enhanced Main Content */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Recent Matches</CardTitle>
                    <CardDescription className="text-slate-600">People you've matched with recently</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchCount === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="h-8 w-8 text-orange-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">No matches yet</h3>
                      <p className="text-slate-600 mb-4">Start swiping to find your perfect roommate</p>
                      <Link href="/match">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                          <Heart className="h-4 w-4 mr-2" />
                          Start Matching
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">You have {matchCount} match{matchCount !== 1 ? 'es' : ''}!</h3>
                      <p className="text-slate-600 mb-4">Check your matches page to see them</p>
                      <Link href="/matches">
                        <Button variant="outline" className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                          View Matches
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Upcoming Meetings</CardTitle>
                    <CardDescription className="text-slate-600">Your scheduled roommate meetings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-slate-600 mb-3">No meetings scheduled</p>
                    <p className="text-sm text-slate-500">Schedule meetings with your matches</p>
                  </div>
                  <Link href="/calendar">
                    <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Action Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <Heart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Find More Matches</CardTitle>
                    <CardDescription className="text-slate-600">Continue your search for the perfect roommate</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <Link href="/match">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Heart className="h-5 w-5 mr-2" />
                    Start Matching
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <Edit3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Complete Your Profile</CardTitle>
                    <CardDescription className="text-slate-600">A complete profile gets 75% more matches</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Profile Completion</span>
                      <span className="font-semibold text-slate-800">70%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Add more details to increase your match rate</p>
                  <Link href="/profile/edit">
                    <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                      <Edit3 className="h-4 w-4 mr-2" />
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
  )
}
