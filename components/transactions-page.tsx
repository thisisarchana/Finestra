"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Search, Plus, X, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { formatRupees } from "@/lib/currency"
import { useTransactions, type Transaction } from "@/lib/transaction-context"

type Insights = {
  totalSpent: number
  totalIncome: number
  topCategory: { name: string; amount: number }
  largestExpense: { name: string; amount: number }
  averageDaily: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  trend: "increasing" | "decreasing" | "stable"
  savingsRate: number
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [insights, setInsights] = useState<Insights | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Food",
    amount: "",
    type: "expense" as "expense" | "income",
    icon: "💰",
  })

  const { transactions, setTransactions, addTransaction } = useTransactions()

  const categories = ["all", "Food", "Transport", "Entertainment", "Income", "Shopping"]

  const analyzeTransactions = (txs: Transaction[]) => {
    const expenses = txs.filter((t) => t.amount < 0)
    const income = txs.filter((t) => t.amount > 0)

    const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)

    // Category breakdown
    const categoryTotals: Record<string, number> = {}
    expenses.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
    })

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)

    const topCategory = categoryBreakdown[0] || { name: "N/A", amount: 0 }

    // Largest expense
    const largestExpense = expenses.reduce(
      (max, t) => (Math.abs(t.amount) > max.amount ? { name: t.name, amount: Math.abs(t.amount) } : max),
      { name: "N/A", amount: 0 },
    )

    // Calculate date range for average
    const dates = txs.map((t) => new Date(t.date).getTime())
    const daysDiff = Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)))
    const averageDaily = totalSpent / daysDiff

    // Calculate trend (simple: compare first half vs second half)
    const sortedTxs = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const midpoint = Math.floor(sortedTxs.length / 2)
    const firstHalfSpending =
      sortedTxs.slice(0, midpoint).reduce((sum, t) => sum + Math.abs(t.amount), 0) / Math.max(1, midpoint)
    const secondHalfSpending =
      sortedTxs.slice(midpoint).reduce((sum, t) => sum + Math.abs(t.amount), 0) /
      Math.max(1, sortedTxs.length - midpoint)

    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (secondHalfSpending > firstHalfSpending * 1.1) trend = "increasing"
    else if (secondHalfSpending < firstHalfSpending * 0.9) trend = "decreasing"

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0

    return {
      totalSpent,
      totalIncome,
      topCategory: { name: topCategory.category, amount: topCategory.amount },
      largestExpense,
      averageDaily,
      categoryBreakdown,
      trend,
      savingsRate,
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] File upload started")
    const file = e.target.files?.[0]
    if (!file) {
      console.log("[v0] No file selected")
      return
    }

    console.log("[v0] File selected:", file.name, "Size:", file.size)

    try {
      const text = await file.text()
      console.log("[v0] File read successfully, length:", text.length)
      console.log("[v0] First 200 characters:", text.substring(0, 200))

      const lines = text.split("\n").filter((line) => line.trim())
      console.log("[v0] Total lines:", lines.length)

      if (lines.length < 2) {
        alert("CSV file appears to be empty or only contains headers")
        return
      }

      const headers = lines[0]
        .toLowerCase()
        .split(",")
        .map((h) => h.trim())
      console.log("[v0] Headers found:", headers)

      const dateIndex = headers.findIndex((h) => h.includes("date"))
      const nameIndex = headers.findIndex(
        (h) => h.includes("name") || h.includes("description") || h.includes("merchant"),
      )
      const amountIndex = headers.findIndex((h) => h.includes("amount") || h.includes("price") || h.includes("total"))
      const categoryIndex = headers.findIndex((h) => h.includes("category") || h.includes("type"))

      console.log(
        "[v0] Column indices - Date:",
        dateIndex,
        "Name:",
        nameIndex,
        "Amount:",
        amountIndex,
        "Category:",
        categoryIndex,
      )

      if (dateIndex === -1 || nameIndex === -1 || amountIndex === -1) {
        alert(
          `CSV must contain columns for date, name/description, and amount.\n\nFound headers: ${headers.join(", ")}`,
        )
        return
      }

      const newTransactions: Transaction[] = []
      let maxId = Math.max(...transactions.map((t) => t.id), 0)
      let successCount = 0
      let errorCount = 0

      for (let i = 1; i < lines.length; i++) {
        try {
          // Better CSV parsing that handles quotes
          const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
          console.log(`[v0] Processing line ${i}:`, values)

          if (values.length < 3) {
            console.log(`[v0] Line ${i} skipped - not enough values`)
            errorCount++
            continue
          }

          const amountStr = values[amountIndex].replace(/[^0-9.-]/g, "")
          const amount = Number.parseFloat(amountStr)

          if (isNaN(amount)) {
            console.log(`[v0] Line ${i} skipped - invalid amount:`, values[amountIndex])
            errorCount++
            continue
          }

          const category = categoryIndex !== -1 && values[categoryIndex] ? values[categoryIndex].trim() : "Other"
          const icon = getCategoryIcon(category)

          newTransactions.push({
            id: ++maxId,
            date: formatDate(values[dateIndex].trim()),
            name: values[nameIndex].trim() || "Unknown Transaction",
            category: category,
            amount: amount,
            icon: icon,
          })
          successCount++
          console.log(`[v0] Line ${i} processed successfully`)
        } catch (err) {
          console.error(`[v0] Error processing line ${i}:`, err)
          errorCount++
        }
      }

      console.log(`[v0] Processing complete - Success: ${successCount}, Errors: ${errorCount}`)

      if (newTransactions.length === 0) {
        alert("No valid transactions found in CSV file")
        return
      }

      const updatedTransactions = [...newTransactions, ...transactions]
      setTransactions(updatedTransactions)
      console.log("[v0] Transactions updated, total count:", updatedTransactions.length)

      // Generate insights
      console.log("[v0] Generating insights...")
      const newInsights = analyzeTransactions(updatedTransactions)
      console.log("[v0] Insights generated:", newInsights)
      setInsights(newInsights)
      setShowInsights(true)

      alert(
        `Successfully imported ${successCount} transactions!${errorCount > 0 ? ` (${errorCount} rows skipped)` : ""}`,
      )
    } catch (error) {
      console.error("[v0] Error during file upload:", error)
      alert(`Error processing CSV file: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      return date.toISOString().split("T")[0]
    } catch {
      return new Date().toISOString().split("T")[0]
    }
  }

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      Food: "🍽️",
      Transport: "🚗",
      Entertainment: "🎬",
      Income: "💰",
      Shopping: "🛒",
      Other: "💳",
    }
    return iconMap[category] || "💳"
  }

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) return

    addTransaction({
      date: new Date().toISOString().split("T")[0],
      name: formData.name,
      category: formData.category,
      amount: formData.type === "expense" ? -amount : amount,
      icon: formData.icon,
    })

    setIsModalOpen(false)
    setFormData({
      name: "",
      category: "Food",
      amount: "",
      type: "expense",
      icon: "💰",
    })
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || tx.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const iconOptions = ["💰", "☕", "🛒", "🚗", "🎬", "⛽", "🍽️", "🎫", "🏠", "💊", "📱", "👕"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-800">Transactions</h1>
            <p className="text-gray-600 mt-2">View and manage all your transactions</p>
          </div>
          <div className="flex gap-3">
            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-6 h-6 mr-2" />
                Add Transaction
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-teal-500 text-teal-600 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-teal-50 bg-transparent"
              >
                <Upload className="w-5 h-5" />
                Import CSV
              </Button>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>
        </div>

        {showInsights && insights && (
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💡</span>
                <h2 className="text-2xl font-black text-gray-800">Transaction Insights</h2>
              </div>
              <button
                onClick={() => setShowInsights(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/70 rounded-xl p-4 border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-black text-red-600">{formatRupees(insights.totalSpent)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-gray-600">Avg. {formatRupees(insights.averageDaily)}/day</p>
                </div>
              </div>

              <div className="bg-white/70 rounded-xl p-4 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-black text-green-600">{formatRupees(insights.totalIncome)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-gray-600">Savings: {insights.savingsRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/70 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-sm font-bold text-purple-700 mb-2">🏆 Top Spending Category</p>
                <p className="text-lg font-black text-gray-800">
                  {insights.topCategory.name} - {formatRupees(insights.topCategory.amount)}
                </p>
                <div className="mt-3 space-y-2">
                  {insights.categoryBreakdown.slice(0, 3).map((cat) => (
                    <div key={cat.category} className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 min-w-[120px]">
                        {cat.category}: {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/70 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm font-bold text-blue-700 mb-2">💸 Largest Single Expense</p>
                <p className="text-lg font-black text-gray-800">
                  {insights.largestExpense.name} - {formatRupees(insights.largestExpense.amount)}
                </p>
              </div>

              <div className="bg-white/70 rounded-xl p-4 border-2 border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm font-bold text-amber-700">Spending Trend</p>
                </div>
                <p className="text-gray-700">
                  {insights.trend === "increasing" &&
                    "Your spending is increasing over time. Consider reviewing your budget."}
                  {insights.trend === "decreasing" && "Great job! Your spending is decreasing over time."}
                  {insights.trend === "stable" && "Your spending is relatively stable."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="bg-white border-2 border-purple-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`capitalize whitespace-nowrap rounded-full font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-teal-500 to-purple-500 text-white"
                    : "border-2 border-purple-200 text-gray-700 hover:border-purple-500"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </Card>

        {/* Transactions List */}
        {transactions.length > 0 && (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <Card
                key={tx.id}
                className={`bg-white border-2 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all flex items-center justify-between ${
                  tx.amount > 0
                    ? "border-green-200 hover:border-green-400"
                    : "border-purple-200 hover:border-purple-400"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl border-2 border-purple-200">
                    {tx.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{tx.name}</p>
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>{tx.date}</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">{tx.category}</span>
                    </div>
                  </div>
                </div>
                <p className={`text-2xl font-black ${tx.amount > 0 ? "text-green-600" : "text-gray-800"}`}>
                  {tx.amount > 0 ? "+" : ""} {formatRupees(Math.abs(tx.amount))}
                </p>
              </Card>
            ))}

            {filteredTransactions.length === 0 && (
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-12 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-xl font-bold text-gray-800 mb-2">No transactions found</p>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </Card>
            )}
          </div>
        )}

        {/* Empty State - Only show if no transactions at all */}
        {transactions.length === 0 && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-12 text-center">
            <p className="text-5xl mb-4">💰</p>
            <p className="text-2xl font-bold text-gray-800 mb-3">No transactions yet</p>
            <p className="text-gray-600 mb-6">
              Start tracking your finances by adding your first transaction or importing from a CSV file
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-bold"
              >
                Add Transaction
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-teal-500 text-teal-600 px-6 py-2 rounded-full font-bold hover:bg-teal-50"
              >
                Import CSV
              </Button>
            </div>
          </Card>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-800">Add Transaction</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Transaction Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Transaction Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Coffee Shop"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense" })}
                    className={`flex-1 ${
                      formData.type === "expense"
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Expense
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`flex-1 ${
                      formData.type === "income"
                        ? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Income
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-white"
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Income">Income</option>
                  <option value="Shopping">Shopping</option>
                </select>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-2xl p-3 rounded-xl transition-all ${
                        formData.icon === icon
                          ? "bg-gradient-to-br from-teal-100 to-purple-100 border-2 border-purple-500"
                          : "bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-shadow"
              >
                Add Transaction
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
