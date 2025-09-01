"use client"

import { usePathname } from "next/navigation"
import DashboardNav from "./dashboard-nav"
import Footer from "./footer"

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide nav on these routes
  const hideOnPaths = ["/", "/login", "/register"]
  const showDashboardNav = !hideOnPaths.includes(pathname ?? "") // ✅ handles null safely

  return (
    <div className="flex flex-col min-h-screen">
      {showDashboardNav && <DashboardNav />}
      <main className="flex-1 overflow-visible">{children}</main>
      <Footer />
    </div>
  )
}
