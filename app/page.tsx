import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, MessageCircle, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col mobile-height-screen">
      <header className="border-b pt-safe">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Home className="h-5 w-5 text-orange-500" />
            <span>RoomMatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto no-scrollbar">
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-orange-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find Your Perfect Roommate
                  </h1>
                  <p className="max-w-[600px] text-foreground md:text-xl">
                    Swipe, match, and connect with potential roommates who share your lifestyle and preferences.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                   <a href="#how-it-works">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                  </a>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                <div className="relative rounded-lg border bg-background p-4 shadow-lg">
                  <div className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-lg">
                      <img
                        src="/promo.png"
                        alt="App preview"
                        className="object-cover w-full"
                      />

                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4 shadow-sm">
                        <Users className="h-6 w-6 text-orange-500 mb-2" />
                        <p className="text-sm font-medium">Match</p>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4 shadow-sm">
                        <MessageCircle className="h-6 w-6 text-orange-500 mb-2" />
                        <p className="text-sm font-medium">Chat</p>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4 shadow-sm">
                        <Home className="h-6 w-6 text-orange-500 mb-2" />
                        <p className="text-sm font-medium">Move In</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  RoomMatch makes finding a roommate as easy as swiping right.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Create Your Profile</h3>
                  <p className="text-foreground">
                    Tell us about yourself, your lifestyle, and what you're looking for in a roommate.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <ArrowRight className="h-6 w-6 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Swipe & Match</h3>
                  <p className="text-foreground">
                    Browse potential roommates and swipe right on those you'd like to connect with.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Chat & Meet</h3>
                  <p className="text-foreground">
                    Connect through our chat and schedule meetings to find your perfect roommate match.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/*<footer className="border-t py-6 md:py-0 pb-safe">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-sm text-foreground">
            &copy; {new Date().getFullYear()} RoomMatch. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>*/}
    </div>
  )
}
