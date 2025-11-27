"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import { formatRupees } from "@/lib/currency"

interface IntroPageProps {
  onStart: (name: string, budget: number, subscriptions: Array<{ name: string; icon: string; amount: number }>) => void
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

export default function IntroPage({ onStart }: IntroPageProps) {
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<
    Array<{ name: string; icon: string; amount: number }>
  >([])
  const [showDropdown, setShowDropdown] = useState(false)

  const handleGetStarted = () => {
    setShowBudgetForm(true)
  }

  const toggleSubscription = (sub: (typeof AVAILABLE_SUBSCRIPTIONS)[0]) => {
    if (selectedSubscriptions.some((s) => s.name === sub.name)) {
      setSelectedSubscriptions(selectedSubscriptions.filter((s) => s.name !== sub.name))
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, sub])
    }
  }

  const suggestedSavings = budget ? Math.round(Number(budget) * 0.2) : 0 // 20% rule
  const totalSubscriptionCost = selectedSubscriptions.reduce((sum, s) => sum + s.amount, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && budget && Number(budget) > 0) {
      onStart(name.trim(), Number(budget), selectedSubscriptions)
    }
  }

  if (showBudgetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden dark">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-[#00b4d8]/20 to-[#90e0ef]/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-[#90e0ef]/20 to-[#caf0f8]/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

        <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h2 className="text-3xl font-black text-white mb-2 text-center">Let's get started!</h2>
          <p className="text-gray-200 text-center mb-8">Tell us a bit about yourself</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-white mb-2">
                What's your name?
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-white/90 border-2 border-[#00b4d8] text-gray-900 placeholder:text-gray-500 focus:border-[#0077b6] focus:ring-2 focus:ring-[#00b4d8]"
                required
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-bold text-white mb-2">
                What's your monthly budget?
              </label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-xl bg-white/90 border-2 border-[#00b4d8] text-gray-900 placeholder:text-gray-500 focus:border-[#0077b6] focus:ring-2 focus:ring-[#00b4d8]"
                min="1"
                required
              />
              {suggestedSavings > 0 && (
                <div className="mt-3 bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                  <p className="text-sm text-green-200">
                    💡 <span className="font-bold">Savings Goal Suggestion:</span> Try to save at least{" "}
                    <span className="font-black text-green-100">{formatRupees(suggestedSavings)}</span> per month (20%
                    of your budget)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Add Subscriptions (Optional)</label>
              <div className="relative mb-3">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full bg-white/90 border-2 border-[#00b4d8] text-gray-900 rounded-xl p-3 flex items-center justify-between hover:bg-white transition-colors"
                >
                  <span className="text-left font-medium">
                    {selectedSubscriptions.length > 0
                      ? `${selectedSubscriptions.length} subscription(s) selected`
                      : "Select your subscriptions"}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white rounded-xl mt-2 z-10 max-h-64 overflow-y-auto shadow-lg border-2 border-[#00b4d8]">
                    {AVAILABLE_SUBSCRIPTIONS.map((sub) => (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => toggleSubscription(sub)}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#caf0f8]/50 transition-colors border-b border-gray-200 last:border-b-0 ${
                          selectedSubscriptions.some((s) => s.name === sub.name) ? "bg-[#caf0f8]/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{sub.icon}</span>
                          <div>
                            <p className="text-gray-900 font-medium">{sub.name}</p>
                            <p className="text-xs text-gray-600">{formatRupees(sub.amount)}/month</p>
                          </div>
                        </div>
                        {selectedSubscriptions.some((s) => s.name === sub.name) && (
                          <div className="w-5 h-5 bg-[#00b4d8] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedSubscriptions.length > 0 && (
                <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <p className="text-sm text-white font-bold mb-2">Selected Subscriptions:</p>
                  <div className="space-y-1">
                    {selectedSubscriptions.map((sub) => (
                      <div key={sub.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-200">
                          {sub.icon} {sub.name}
                        </span>
                        <span className="text-[#90e0ef] font-bold">{formatRupees(sub.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/20 mt-2 pt-2">
                    <p className="text-sm text-gray-200">
                      Total:{" "}
                      <span className="text-[#90e0ef] font-bold">{formatRupees(totalSubscriptionCost)}/month</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full px-8 py-6 text-lg font-bold bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] text-white rounded-full shadow-lg hover:shadow-xl transition-all border-0"
            >
              Start Your Journey
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden dark">
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-[#00b4d8]/20 to-[#90e0ef]/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-[#90e0ef]/20 to-[#caf0f8]/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-l from-[#caf0f8]/15 to-[#90e0ef]/5 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="absolute top-20 left-10 w-3 h-3 bg-[#90e0ef] rounded-full opacity-60"></div>
      <div className="absolute top-32 right-20 w-4 h-4 bg-[#caf0f8] rounded-full opacity-50"></div>
      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#00b4d8] rounded-full opacity-70"></div>
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#0077b6] rounded-full opacity-60"></div>
      <div className="absolute top-2/3 left-1/4 w-4 h-4 bg-[#90e0ef] rounded-full opacity-50"></div>

      <div
        className="absolute top-1/2 right-1/4 w-6 h-6 border-2 border-[#caf0f8] opacity-40 pointer-events-none"
        style={{ transform: "rotate(45deg)" }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/3 w-5 h-1 bg-[#90e0ef] rounded opacity-50 pointer-events-none"
        style={{ transform: "rotate(15deg)" }}
      ></div>
      <div
        className="absolute top-1/3 right-20 w-5 h-1 bg-[#00b4d8] rounded opacity-50 pointer-events-none"
        style={{ transform: "rotate(-30deg)" }}
      ></div>

      <div className="relative z-10 max-w-2xl text-center">
        {/* Hero Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-black text-balance leading-tight mb-4 text-white">
            Budget smarter.
          </h1>
          <h2 className="text-6xl md:text-7xl font-black text-balance leading-tight mb-6">
            <span className="bg-gradient-to-r from-[#00b4d8] via-[#90e0ef] to-[#caf0f8] bg-clip-text text-transparent">
              Save effortlessly.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-200 font-medium mt-8 max-w-xl mx-auto">
            Snap receipts, import CSVs, and let AI sort the rest.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={handleGetStarted}
            className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#03045e] hover:to-[#0077b6] text-white rounded-full shadow-lg hover:shadow-xl transition-all border-0"
          >
            Get Started
          </Button>
        </div>

        {/* Phone Mockup or Preview Element */}
        <div className="relative mx-auto max-w-sm mb-8">
          <div className="bg-gradient-to-br from-[#0077b6] to-[#00b4d8] rounded-3xl p-1 shadow-2xl">
            <div className="bg-black rounded-2xl p-4 space-y-3">
              <div className="h-2 bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] rounded-full w-3/4 mx-auto opacity-60"></div>
              <div className="space-y-2 px-4">
                <div className="h-16 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] rounded-lg opacity-70"></div>
                <div className="h-12 bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] rounded-lg opacity-70"></div>
                <div className="h-12 bg-gradient-to-r from-[#03045e] to-[#0077b6] rounded-lg opacity-70"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00b4d8] to-[#90e0ef] text-gray-900 rounded-full px-6 py-3 font-bold text-sm shadow-lg mb-8">
          <span className="text-xl">⭐</span>
          ACHIEVEMENT UNLOCKED
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span>AI-Powered Insights</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span>Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <span>Gamified Experience</span>
          </div>
        </div>
      </div>
    </div>
  )
}
