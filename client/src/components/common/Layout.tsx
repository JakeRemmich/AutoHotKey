import React from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="flex">
        <main className="flex-1">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}