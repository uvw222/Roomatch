import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ViewportHandler from "@/components/viewport-handler"
import LayoutShell from "@/components/layout-shell"
import CurrentLocationDetector from "@/components/CurrentLocationDetector"
import { ProfileProvider } from "@/hooks/useProfile"
import { AuthProvider } from "@/hooks/useAuth"
import { UnreadMessagesProvider } from "@/hooks/useUnreadMessages"
import GlobalMatchNotification from "@/components/GlobalMatchNotification"
import NotificationSound from "@/components/notification-sound"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RoomMatch - Find Your Perfect Roommate",
  description: "Match with potential roommates in a simple, fun way",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RoomMatch",
  },
  formatDetection: {
    telephone: false,
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ea580c",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} h-full overflow-x-hidden`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              <UnreadMessagesProvider>
                <ViewportHandler />
                <CurrentLocationDetector />
                <LayoutShell>{children}</LayoutShell>
                <GlobalMatchNotification />
                <NotificationSound />
              </UnreadMessagesProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
