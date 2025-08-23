import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, MessageCircle, Users, Heart, Star, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col mobile-height-screen">
      {/* Enhanced Header */}
      <header className="border-b bg-white/80 backdrop-blur-md pt-safe sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-all duration-200 group">
            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">RoomMatch</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:bg-orange-50 hover:text-orange-600 transition-all duration-200">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto no-scrollbar">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 shadow-sm">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-slate-700">Find Your Perfect Match</span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                    Find Your Perfect Roommate
                  </h1>
                  <p className="max-w-[600px] text-slate-600 md:text-xl leading-relaxed">
                    Swipe, match, and connect with potential roommates who share your lifestyle, preferences, and values. 
                    <span className="font-semibold text-slate-800"> Your ideal living situation starts here.</span>
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 group">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200">
                      Learn More
                    </Button>
                  </a>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600">10,000+ Successful Matches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <span className="text-sm text-slate-600">Verified Profiles</span>
                  </div>
                </div>
              </div>

              {/* Enhanced App Preview */}
              <div className="mx-auto lg:mx-0 relative">
                <div className="relative rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 shadow-2xl">
                  <div className="space-y-6">
                    <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
                      <img
                        src="/promo.png"
                        alt="App preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-orange-50 to-red-50 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mb-2">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Match</p>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mb-2">
                          <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Chat</p>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mb-2">
                          <Home className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Move In</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Simple & Fast</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="max-w-[700px] text-slate-600 md:text-xl leading-relaxed">
                  RoomMatch makes finding a roommate as easy as swiping right. 
                  <span className="font-semibold text-slate-800"> Three simple steps to your perfect match.</span>
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-6 group">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 shadow-lg group-hover:scale-110 transition-all duration-200">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-800">Create Your Profile</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Tell us about yourself, your lifestyle preferences, budget, and what you're looking for in a roommate. 
                    The more details, the better your matches.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6 group">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg group-hover:scale-110 transition-all duration-200">
                  <ArrowRight className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-800">Swipe & Match</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Browse potential roommates and swipe right on those you'd like to connect with. 
                    Our algorithm matches you based on compatibility factors.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6 group">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg group-hover:scale-110 transition-all duration-200">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-800">Chat & Meet</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Connect through our secure chat and schedule meetings to find your perfect roommate match. 
                    Take your time to get to know each other.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                Why Choose RoomMatch?
              </h2>
              <p className="max-w-[600px] mx-auto text-slate-600 md:text-lg">
                We're committed to making your roommate search safe, efficient, and successful.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Verified Profiles</h3>
                <p className="text-slate-600 leading-relaxed">
                  All profiles are verified to ensure you're connecting with real people who are serious about finding a roommate.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Smart Matching</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our advanced algorithm considers lifestyle, budget, and preferences to find your perfect roommate match.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Secure Chat</h3>
                <p className="text-slate-600 leading-relaxed">
                  Communicate safely through our built-in chat system before meeting in person.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t bg-slate-900 text-white py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">RoomMatch</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-slate-300 hover:text-white transition-colors duration-200">
                Terms
              </Link>
              <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/contact" className="text-slate-300 hover:text-white transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} RoomMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
