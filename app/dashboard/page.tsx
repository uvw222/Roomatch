import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Calendar, User, Home, Heart } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async  function DashboardPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get("user_email")?.value

  if (!email) {
    redirect("/login")
  }
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Welcome back, Alex!</h1>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your roommate search</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-gray-500">+12% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Matches</CardTitle>
              <Heart className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-gray-500">+3 new matches</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500">5 unread messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-500">Next: Tomorrow, 2PM</p>
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
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=48&width=48&text=User${i}`}
                        alt={`User ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Sarah Johnson</h3>
                      <p className="text-sm text-gray-500">Matched 2 days ago</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                ))}
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
                {[1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">May {10 + i}, 2023</span>
                    </div>
                    <p className="text-sm">Meeting with Michael Brown</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Home className="h-4 w-4" />
                      <span>123 Apartment St, #304</span>
                    </div>
                  </div>
                ))}
                <Link href="/calendar">
                  <Button variant="outline" className="w-full">
                    View All Meetings
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
