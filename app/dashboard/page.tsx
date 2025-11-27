"use client"

import { useState } from "react"
import Dashboard from "@/components/dashboard"
import GoalsPage from "@/components/goals-page"
import RewardsPage from "@/components/rewards-page"
import TransactionsPage from "@/components/transactions-page"
import Navigation from "@/components/navigation"

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "goals" | "rewards" | "transactions">("dashboard")

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "goals" && <GoalsPage />}
        {currentPage === "rewards" && <RewardsPage />}
        {currentPage === "transactions" && <TransactionsPage />}
      </main>
    </div>
  )
}
