"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Target, Trophy, CreditCard } from "lucide-react"

interface NavigationProps {
  currentPage: "dashboard" | "goals" | "rewards" | "transactions"
  onNavigate: (page: "dashboard" | "goals" | "rewards" | "transactions") => void
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: "dashboard", label: "Overview", icon: BarChart3 },
    { id: "goals", label: "Goals", icon: Target },
    { id: "rewards", label: "Rewards", icon: Trophy },
    { id: "transactions", label: "Transactions", icon: CreditCard },
  ]

  return (
    /* Updated header gradient and border to blue scheme */
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#03045e] border-b-2 border-[#00b4d8]/30 shadow-sm dark">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          /* Updated icon gradient to cyan/blue */
          <div className="w-10 h-10 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-full flex items-center justify-center text-gray-900 font-bold text-lg">
            💰
          </div>
          <span className="font-bold text-white hidden sm:inline">Finestra</span>
        </div>

        <div className="flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <Button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                variant={isActive ? "default" : "ghost"}
                /* Updated active button gradient to cyan/blue scheme */
                className={`gap-2 transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white"
                    : "text-gray-400 hover:text-[#90e0ef] hover:bg-[#00b4d8]/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
