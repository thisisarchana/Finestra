"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Transaction = {
  id: number
  date: string
  name: string
  category: string
  amount: number
  icon: string
}

export type Subscription = {
  id: number
  name: string
  amount: number
  renewalDate: string
  icon: string
}

type TransactionContextType = {
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  clearAllTransactions: () => void
  monthlyBudget: number
  setMonthlyBudget: (budget: number) => void
  subscriptions: Subscription[]
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>
  addSubscription: (subscription: Omit<Subscription, "id">) => void
  removeSubscription: (id: number) => void
  userName: string
  setUserName: (name: string) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(0)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [userName, setUserNameState] = useState<string>("")

  useEffect(() => {
    const stored = localStorage.getItem("finestra_transactions")
    const storedBudget = localStorage.getItem("finestra_monthly_budget")
    const storedSubscriptions = localStorage.getItem("finestra_subscriptions")
    const storedUserName = localStorage.getItem("finestra_user_name")

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log("[v0] Context - Loaded transactions from localStorage:", parsed.length)
        setTransactions(parsed)
      } catch (error) {
        console.error("Failed to parse stored transactions:", error)
        setTransactions([])
      }
    }

    if (storedBudget) {
      try {
        setMonthlyBudgetState(Number(storedBudget))
      } catch (error) {
        console.error("Failed to parse stored budget:", error)
      }
    }

    if (storedSubscriptions) {
      try {
        setSubscriptions(JSON.parse(storedSubscriptions))
      } catch (error) {
        console.error("Failed to parse stored subscriptions:", error)
        setSubscriptions([])
      }
    }

    if (storedUserName) {
      setUserNameState(storedUserName)
    }

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finestra_transactions", JSON.stringify(transactions))
    }
  }, [transactions, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finestra_subscriptions", JSON.stringify(subscriptions))
    }
  }, [subscriptions, isLoaded])

  useEffect(() => {
    console.log("[v0] Context - Transactions updated, count:", transactions.length)
  }, [transactions])

  const setMonthlyBudget = (budget: number) => {
    setMonthlyBudgetState(budget)
    localStorage.setItem("finestra_monthly_budget", String(budget))
  }

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Math.max(...transactions.map((t) => t.id), 0) + 1,
    }
    console.log("[v0] Context - Adding transaction:", newTransaction)
    setTransactions([newTransaction, ...transactions])
  }

  const clearAllTransactions = () => {
    setTransactions([])
    localStorage.removeItem("finestra_transactions")
    console.log("[v0] Context - All transactions cleared")
  }

  const addSubscription = (subscription: Omit<Subscription, "id">) => {
    const newSubscription = {
      ...subscription,
      id: Math.max(...subscriptions.map((s) => s.id), 0) + 1,
    }
    setSubscriptions([...subscriptions, newSubscription])
  }

  const removeSubscription = (id: number) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id))
  }

  const setUserName = (name: string) => {
    setUserNameState(name)
    localStorage.setItem("finestra_user_name", name)
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        setTransactions,
        addTransaction,
        clearAllTransactions,
        monthlyBudget,
        setMonthlyBudget,
        subscriptions,
        setSubscriptions,
        addSubscription,
        removeSubscription,
        userName,
        setUserName,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
