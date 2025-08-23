import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Calendar, User, Home, Heart } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export default async function DashboardPage() {
  const cookieStore = await cookies()
const email = cookieStore.get("user_email")?.value

  if (!email) {
    redirect("/login")
  }

  const profiles = await getCollection("profiles")
  const profile = await profiles.findOne({ email })
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
const unreadCount = await messagesCol.countDocuments({ to: email, read: false })

console.log("Profile ID:", profile._id)
console.log("Liked profiles:", profile.likedProfiles)
console.log("Converted liked profiles:", likedObjectIds)
console.log("Match count:", mutualMatches.length)
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Welcome back, {profile.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your roommate search</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.views ?? 0}</div>
              
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Matches</CardTitle>
              <Heart className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchCount}</div>
              <p className="text-xs text-gray-500"></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-gray-500">unread messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">No meetings scheduled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>People you've matched with recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matchCount === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No matches yet</p>
                    <p className="text-sm text-gray-400">Start swiping to find your perfect roommate</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">You have {matchCount} match{matchCount !== 1 ? 'es' : ''}</p>
                    <p className="text-sm text-gray-400">Check your matches page to see them</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Your scheduled roommate meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 border rounded-lg">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No meetings scheduled</p>
                  <p className="text-sm text-gray-400">Schedule meetings with your matches</p>
                </div>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full">
                    Schedule Meeting
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Find More Matches</CardTitle>
              <CardDescription>Continue your search for the perfect roommate</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Link href="/match">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Heart className="h-5 w-5 mr-2" />
                  Start Matching
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>A complete profile gets 75% more matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                </div>
                <p className="text-sm text-gray-500">Your profile is 70% complete</p>
                <Link href="/profile/edit">
                  <Button variant="outline" className="w-full">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
