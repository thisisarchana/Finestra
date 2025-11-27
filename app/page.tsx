"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import IntroPage from "@/components/intro-page"
import Dashboard from "@/components/dashboard"
import GoalsPage from "@/components/goals-page"
import RewardsPage from "@/components/rewards-page"
import TransactionsPage from "@/components/transactions-page"
import BudgetSetup from "@/components/budget-setup"
import Navigation from "@/components/navigation"
import { TransactionProvider } from "@/lib/transaction-context"

export default function Home() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<
    "intro" | "budget-setup" | "dashboard" | "goals" | "rewards" | "transactions"
  >("intro")
  const [hasStarted, setHasStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = () => {
    setIsLoading(true)
    setCurrentPage("budget-setup")
    setIsLoading(false)
  }

  const handleGetStarted = () => {
    setIsLoading(true)
    setCurrentPage("budget-setup")
    setIsLoading(false)
  }

  const handleBudgetComplete = () => {
    setHasStarted(true)
    setCurrentPage("dashboard")
  }

  // Show intro page
  if (currentPage === "intro") {
    return <IntroPage onStart={handleStart} onGetStarted={handleGetStarted} />
  }

  if (currentPage === "budget-setup") {
    return (
      <TransactionProvider>
        <BudgetSetup onComplete={handleBudgetComplete} />
      </TransactionProvider>
    )
  }

  return (
    <TransactionProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

        <main className="flex-1">
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "goals" && <GoalsPage />}
          {currentPage === "rewards" && <RewardsPage />}
          {currentPage === "transactions" && <TransactionsPage />}
        </main>
      </div>
    </TransactionProvider>
  )
}
