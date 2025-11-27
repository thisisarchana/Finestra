"use client"
import { useState } from "react"
import IntroPage from "@/components/intro-page"
import Dashboard from "@/components/dashboard"
import GoalsPage from "@/components/goals-page"
import RewardsPage from "@/components/rewards-page"
import TransactionsPage from "@/components/transactions-page"
import Navigation from "@/components/navigation"
import { TransactionProvider, useTransactions } from "@/lib/transaction-context"

function AppContent() {
  const [currentPage, setCurrentPage] = useState<
    "intro" | "budget-setup" | "dashboard" | "goals" | "rewards" | "transactions"
  >("intro")
  const { monthlyBudget, userName, setUserName, setMonthlyBudget, addSubscription } = useTransactions()

  const handleStart = (
    name: string,
    budget: number,
    subscriptions: Array<{ name: string; icon: string; amount: number }>,
  ) => {
    setUserName(name)
    setMonthlyBudget(budget)

    // Add all selected subscriptions
    subscriptions.forEach((sub) => {
      const renewalDate = new Date()
      renewalDate.setDate(renewalDate.getDate() + 30)
      addSubscription({
        name: sub.name,
        icon: sub.icon,
        amount: sub.amount,
        renewalDate: renewalDate.toISOString().split("T")[0],
      })
    })

    setCurrentPage("dashboard")
  }

  // Show intro page
  if (currentPage === "intro") {
    return <IntroPage onStart={handleStart} />
  }

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

export default function Home() {
  return (
    <TransactionProvider>
      <AppContent />
    </TransactionProvider>
  )
}
