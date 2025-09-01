import type { ReactNode } from "react"

export default function DashboardLayout({ children }: { ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
