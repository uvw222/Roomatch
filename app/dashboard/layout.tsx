import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col mobile-height-screen">
      <main className="flex-1 overflow-auto no-scrollbar">{children}</main>
    </div>
  )
}
