import type { ReactNode } from "react"
import DashboardNav from "@/components/dashboard-nav"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col mobile-height-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto no-scrollbar">{children}</main>
    </div>
  )
}
