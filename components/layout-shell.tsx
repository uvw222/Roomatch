"use client"

import { usePathname } from "next/navigation"
import DashboardNav from "./dashboard-nav"

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide nav on these routes
  const hideOnPaths = ["/", "/login", "/signup"]
  const showDashboardNav = !hideOnPaths.includes(pathname ?? "") // ✅ handles null safely

  return (
    <div className="flex flex-col h-full">
      {showDashboardNav && <DashboardNav />}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
