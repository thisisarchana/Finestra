"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, ArrowDownLeft, Zap, Trash2 } from "lucide-react"
import Mascot from "@/components/mascot"
import { formatRupees } from "@/lib/currency"
import { useTransactions } from "@/lib/transaction-context"

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return "1 week ago"
  return `${Math.floor(diffDays / 7)} weeks ago`
}

const CATEGORY_COLORS = [
  "#ff6b6b", // Vibrant red
  "#4ecdc4", // Turquoise
  "#45b7d1", // Sky blue
  "#ffa07a", // Light salmon
  "#98d8c8", // Mint
  "#f7b731", // Golden yellow
  "#5f27cd", // Purple
  "#00d2d3", // Cyan
  "#ff9ff3", // Pink
  "#54a0ff", // Blue
  "#48dbfb", // Light blue
  "#ff6348", // Tomato red
]

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("monthly")
  const { transactions, monthlyBudget, subscriptions, removeSubscription } = useTransactions()

  useEffect(() => {
    console.log("[v0] Dashboard - Total transactions:", transactions.length)
    console.log("[v0] Dashboard - Transactions data:", transactions)
  }, [transactions])

  const stats = useMemo(() => {
    console.log("[v0] Dashboard - Recalculating stats with", transactions.length, "transactions")

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date)
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    })

    console.log("[v0] Dashboard - Current month transactions:", currentMonthTransactions.length)

    const expenses = currentMonthTransactions.filter((t) => t.amount < 0)
    const income = currentMonthTransactions.filter((t) => t.amount > 0)

    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const savings = totalIncome - totalExpenses

    const getDaysAgo = (days: number) => {
      const date = new Date(now)
      date.setDate(date.getDate() - days)
      return date
    }

    const dailyExpenses = expenses
      .filter((t) => new Date(t.date) >= getDaysAgo(1))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const weeklyExpenses = expenses
      .filter((t) => new Date(t.date) >= getDaysAgo(7))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const monthlyExpenses = totalExpenses // Already filtered to current month

    // Category breakdown for pie chart with dynamic colors
    const categoryTotals: Record<string, number> = {}
    expenses.forEach((t) => {
      if (t.category !== "Income") {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
      }
    })

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)

    // Weekly trend data
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (3 - i) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const weekExpenses = expenses
        .filter((t) => {
          const txDate = new Date(t.date)
          return txDate >= weekStart && txDate < weekEnd
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return { name: `Week ${i + 1}`, amount: weekExpenses }
    })

    const dailyBudget = Math.round(monthlyBudget / 30)
    const weeklyBudget = Math.round(monthlyBudget / 4.33)

    const budgetData = {
      daily: { total: dailyBudget, spent: dailyExpenses, remaining: dailyBudget - dailyExpenses },
      weekly: { total: weeklyBudget, spent: weeklyExpenses, remaining: weeklyBudget - weeklyExpenses },
      monthly: { total: monthlyBudget, spent: monthlyExpenses, remaining: monthlyBudget - monthlyExpenses },
    }

    // Recent transactions (top 4)
    const recentTransactions = [...currentMonthTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4)
      .map((tx) => ({
        id: tx.id,
        name: tx.name,
        amount: tx.amount,
        category: tx.category,
        icon: tx.icon,
        time: getRelativeTime(tx.date),
      }))

    return {
      totalExpenses,
      totalIncome,
      savings,
      categoryData,
      weeklyData,
      budgetData,
      recentTransactions,
    }
  }, [transactions, monthlyBudget])

  const currentBudget = stats.budgetData[timeframe]
  const spendPercentage = Math.min((currentBudget.spent / currentBudget.total) * 100, 100)
  const savingsPercentage = stats.totalIncome > 0 ? (stats.savings / stats.totalIncome) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 dark">
      <div className="max-w-7xl mx-auto">
        {/* Header with Mascot */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Dashboard</h1>
            <p className="text-gray-300 text-lg">Welcome back! Here's your financial overview</p>
          </div>
          <Mascot mood="happy" />
        </div>

        {/* Budget Card - Main */}
        <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-2xl mb-8 p-8 text-white rounded-3xl">
          <div className="mb-6">
            <p className="text-lg opacity-90 capitalize">{timeframe} Budget</p>
            <h2 className="text-5xl font-black mt-2">
              {formatRupees(currentBudget.spent)} of {formatRupees(currentBudget.total)}
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${spendPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span>Spent: {spendPercentage.toFixed(1)}%</span>
              <span>Remaining: {formatRupees(Math.max(0, currentBudget.remaining))}</span>
            </div>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex gap-3">
            {(["daily", "weekly", "monthly"] as const).map((tf) => (
              <Button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`capitalize ${
                  timeframe === tf ? "bg-white text-blue-600 font-bold" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {tf}
              </Button>
            ))}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow hover:border-cyan-500/60 dark">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📈</span>
              <ArrowUpRight className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-2">Total Income (This Month)</p>
            <p className="text-3xl font-black text-cyan-300">{formatRupees(stats.totalIncome)}</p>
            <p className="text-xs text-green-400 mt-2">↑ Current month only</p>
          </Card>

          <Card className="bg-slate-800/50 border-2 border-purple-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow hover:border-purple-500/60 dark">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💸</span>
              <ArrowDownLeft className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-gray-400 text-sm mb-2">Total Expenses (This Month)</p>
            <p className="text-3xl font-black text-purple-300">{formatRupees(stats.totalExpenses)}</p>
            <p className="text-xs text-red-400 mt-2">Current month only</p>
          </Card>

          <Card className="bg-slate-800/50 border-2 border-pink-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow hover:border-pink-500/60 dark">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎯</span>
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-gray-400 text-sm mb-2">Saved This Month</p>
            <p className="text-3xl font-black text-pink-300">{formatRupees(stats.savings)}</p>
            <p className="text-xs text-blue-400 mt-2">{savingsPercentage.toFixed(1)}% of income saved</p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card className="bg-slate-800/50 border-2 border-cyan-500/20 rounded-2xl p-6 shadow-lg dark leading-4">
            <h3 className="text-xl font-bold text-white mb-6">Spending by Category</h3>
            {stats.categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupees(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {stats.categoryData.map((cat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-sm text-gray-300">
                        {cat.name}: {formatRupees(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No expense data available</div>
            )}
          </Card>

          {/* Line Chart */}
          <Card className="bg-slate-800/50 border-2 border-purple-500/20 rounded-2xl p-6 shadow-lg dark">
            <h3 className="text-xl font-bold text-white mb-6">Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404060" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip formatter={(value) => formatRupees(value as number)} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ff6b9d"
                  strokeWidth={3}
                  dot={{ fill: "#ff6b9d", r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Subscriptions Tracker & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Subscriptions Tracker Card */}
          <Card className="lg:col-span-1 bg-slate-800/50 border-2 border-green-500/20 rounded-2xl p-6 shadow-lg dark">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Subscriptions</h3>
              <span className="text-2xl">📦</span>
            </div>
            {subscriptions.length > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{sub.icon}</span>
                          <div>
                            <p className="font-bold text-white text-sm">{sub.name}</p>
                            <p className="text-xs text-gray-400">Renews {sub.renewalDate}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSubscription(sub.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-cyan-300 font-bold text-sm">{formatRupees(sub.amount)}/month</p>
                    </div>
                  ))}
                </div>
                <div className="text-sm bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg p-3 border border-green-500/20">
                  <p className="text-green-300 font-bold mb-1">Monthly Subscriptions</p>
                  <p className="text-white font-bold">
                    {formatRupees(subscriptions.reduce((sum, s) => sum + s.amount, 0))}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm mb-4">No subscriptions added yet</p>
                <p className="text-xs text-gray-500">
                  Add your subscriptions from the budget setup or settings to track them here.
                </p>
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-2 border-pink-500/20 rounded-2xl p-6 shadow-lg dark">
            <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
            <div className="space-y-4">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/50"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{tx.icon}</span>
                      <div>
                        <p className="font-bold text-white">{tx.name}</p>
                        <p className="text-sm text-gray-400">
                          {tx.category} • {tx.time}
                        </p>
                      </div>
                    </div>
                    <p className={`font-black text-lg ${tx.amount > 0 ? "text-green-400" : "text-gray-300"}`}>
                      {tx.amount > 0 ? "+" : ""} {formatRupees(Math.abs(tx.amount))}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">No transactions yet</div>
              )}
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="bg-gradient-to-br from-orange-500/20 via-yellow-500/10 to-amber-600/20 border-2 border-orange-500/50 rounded-2xl p-6 shadow-lg dark">
          <div className="flex items-start gap-3 mb-6">
            <span className="text-3xl">💡</span>
            <h3 className="text-lg font-bold text-white">Smart Insights</h3>
          </div>
          <div className="space-y-4">
            {stats.categoryData.length > 0 && (
              <div className="bg-slate-800/60 rounded-lg p-4 border border-orange-500/20">
                <p className="text-sm font-bold text-yellow-300 mb-2">💡 Quick Tip</p>
                <p className="text-sm text-gray-300">
                  Your {stats.categoryData[0].name} spending is {formatRupees(stats.categoryData[0].value)} this month.
                  Consider reviewing this category!
                </p>
              </div>
            )}
            {savingsPercentage > 20 && (
              <div className="bg-slate-800/60 rounded-lg p-4 border border-orange-500/20">
                <p className="text-sm font-bold text-green-300 mb-2">🎉 Achievement</p>
                <p className="text-sm text-gray-300">
                  Great job! You're saving {savingsPercentage.toFixed(1)}% of your income this month!
                </p>
              </div>
            )}
            <div className="bg-slate-800/60 rounded-lg p-4 border border-orange-500/20">
              <p className="text-sm font-bold text-cyan-300 mb-2">🔔 Alert</p>
              <p className="text-sm text-gray-300">
                Your subscriptions total {formatRupees(subscriptions.reduce((sum, s) => sum + s.amount, 0))}/month.
                Consider reviewing unused services.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
