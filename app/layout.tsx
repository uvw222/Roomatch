import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ViewportHandler from "@/components/viewport-handler"

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
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} h-full overflow-x-hidden`}>
        <ThemeProvider defaultTheme="light" disableTransitionOnChange>
          <ViewportHandler />
          <div className="app-container">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
