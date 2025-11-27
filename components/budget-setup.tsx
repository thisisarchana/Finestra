"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatRupees } from "@/lib/currency"
import { useTransactions } from "@/lib/transaction-context"
import { ChevronDown } from "lucide-react"

type BudgetSetupProps = {
  onComplete: () => void
}

const AVAILABLE_SUBSCRIPTIONS = [
  { name: "Netflix", icon: "🎬", amount: 150 },
  { name: "Spotify", icon: "🎵", amount: 99 },
  { name: "Adobe Creative Cloud", icon: "🎨", amount: 500 },
  { name: "Disney+", icon: "🏰", amount: 99 },
  { name: "Amazon Prime", icon: "📦", amount: 299 },
  { name: "Apple Music", icon: "🍎", amount: 99 },
  { name: "YouTube Premium", icon: "▶️", amount: 129 },
  { name: "ChatGPT Plus", icon: "🤖", amount: 200 },
]

export default function BudgetSetup({ onComplete }: BudgetSetupProps) {
  const { monthlyBudget, setMonthlyBudget, addSubscription } = useTransactions()
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget))
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<
    Array<{ name: string; icon: string; amount: number }>
  >([])
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const budget = Number(budgetInput)
    if (budget > 0) {
      setMonthlyBudget(budget)

      selectedSubscriptions.forEach((sub) => {
        const renewalDate = new Date()
        renewalDate.setDate(renewalDate.getDate() + 30)
        addSubscription({
          name: sub.name,
          icon: sub.icon,
          amount: sub.amount,
          renewalDate: renewalDate.toISOString().split("T")[0],
        })
      })

      onComplete()
    }
  }

  const quickBudgets = [10000, 15000, 20000, 30000, 50000]

  const isSubscriptionSelected = (name: string) => selectedSubscriptions.some((s) => s.name === name)

  const toggleSubscription = (sub: (typeof AVAILABLE_SUBSCRIPTIONS)[0]) => {
    if (isSubscriptionSelected(sub.name)) {
      setSelectedSubscriptions(selectedSubscriptions.filter((s) => s.name !== sub.name))
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, sub])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 dark">
      <Card className="max-w-2xl w-full bg-slate-800/80 border-2 border-cyan-500/30 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">💰</span>
          <h1 className="text-4xl font-black text-white mb-3">Set Your Monthly Budget</h1>
          <p className="text-gray-300 text-lg">
            This will help us track your spending and provide personalized insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-cyan-300 mb-3">Monthly Budget Amount</label>
            <Input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Enter amount in ₹"
              className="text-2xl font-bold text-center h-16 bg-slate-700/50 border-2 border-cyan-500/30 text-white"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-300 mb-3">Quick Select</label>
            <div className="grid grid-cols-3 gap-3">
              {quickBudgets.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  onClick={() => setBudgetInput(String(amount))}
                  className={`h-12 ${
                    budgetInput === String(amount)
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold"
                      : "bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  {formatRupees(amount)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-300 mb-3">Add Subscriptions (Optional)</label>
            <div className="relative mb-3">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full bg-slate-700/50 border-2 border-cyan-500/30 text-white rounded-lg p-3 flex items-center justify-between hover:bg-slate-700 transition-colors"
              >
                <span className="text-left">
                  {selectedSubscriptions.length > 0
                    ? `${selectedSubscriptions.length} subscription(s) selected`
                    : "Click to add subscriptions"}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-slate-700 border-2 border-cyan-500/30 rounded-lg mt-2 z-10 max-h-64 overflow-y-auto shadow-lg">
                  {AVAILABLE_SUBSCRIPTIONS.map((sub) => (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => toggleSubscription(sub)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-600 transition-colors border-b border-slate-600/50 ${
                        isSubscriptionSelected(sub.name) ? "bg-slate-600" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sub.icon}</span>
                        <div>
                          <p className="text-white font-medium">{sub.name}</p>
                          <p className="text-xs text-gray-400">{formatRupees(sub.amount)}/month</p>
                        </div>
                      </div>
                      {isSubscriptionSelected(sub.name) && (
                        <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSubscriptions.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-cyan-500/20">
                <p className="text-sm font-bold text-cyan-300 mb-3">Selected Subscriptions:</p>
                <div className="space-y-2">
                  {selectedSubscriptions.map((sub) => (
                    <div key={sub.name} className="flex items-center justify-between bg-slate-600/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sub.icon}</span>
                        <span className="text-white text-sm">{sub.name}</span>
                      </div>
                      <span className="text-cyan-300 font-bold text-sm">{formatRupees(sub.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-600/50 mt-3 pt-3">
                  <p className="text-sm text-gray-300">
                    Total Subscriptions:{" "}
                    <span className="text-cyan-300 font-bold">
                      {formatRupees(selectedSubscriptions.reduce((sum, s) => sum + s.amount, 0))}/month
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-sm text-gray-300">
              <span className="font-bold text-cyan-300">💡 Tip:</span> Your monthly budget should cover all your regular
              expenses including food, transport, entertainment, and bills. You can change this anytime from settings.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
          >
            Continue to Dashboard
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button type="button" onClick={onComplete} className="text-sm text-gray-400 hover:text-gray-300 underline">
            Skip for now
          </button>
        </div>
      </Card>
    </div>
  )
}
