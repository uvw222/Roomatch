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
import { NotificationsProvider } from "@/hooks/useNotifications"
import GlobalMatchNotification from "@/components/GlobalMatchNotification"
import NotificationSound from "@/components/notification-sound"
import { Toaster } from "@/components/ui/sonner"
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
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} h-full overflow-x-hidden`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              <UnreadMessagesProvider>
                <NotificationsProvider>
                  <ViewportHandler />
                  <CurrentLocationDetector />
                  <LayoutShell>{children}</LayoutShell>
                  <GlobalMatchNotification />
                  <NotificationSound />
                  <Toaster />
                </NotificationsProvider>
              </UnreadMessagesProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
