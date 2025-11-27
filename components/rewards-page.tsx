"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Star, Lock, Medal } from "lucide-react"
import { useTransactions } from "@/lib/transaction-context"

const LEADERBOARD_USERS = [
  { id: 1, name: "Rahul Sharma", points: 875, avatar: "👨", level: "Gold", badges: 35 },
  { id: 2, name: "Priya Patel", points: 750, avatar: "👩", level: "Gold", badges: 30 },
  { id: 3, name: "Amit Kumar", points: 625, avatar: "👨‍💼", level: "Silver", badges: 25 },
  { id: 4, name: "Sneha Reddy", points: 550, avatar: "👩‍💼", level: "Silver", badges: 22 },
  { id: 5, name: "Vikram Singh", points: 475, avatar: "🧑", level: "Silver", badges: 19 },
  { id: 6, name: "Anjali Gupta", points: 400, avatar: "👧", level: "Bronze", badges: 16 },
  { id: 7, name: "Rohan Mehta", points: 325, avatar: "🧑‍💻", level: "Bronze", badges: 13 },
  { id: 8, name: "Kavya Iyer", points: 275, avatar: "👩‍🎓", level: "Bronze", badges: 11 },
]

export default function RewardsPage() {
  const { transactions } = useTransactions()

  const achievements = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date)
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    })

    const hasTransactions = transactions.length > 0
    const currentMonthHasTransactions = currentMonthTransactions.length > 0

    const expenses = currentMonthTransactions.filter((t) => t.amount < 0)
    const income = currentMonthTransactions.filter((t) => t.amount > 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0

    return [
      {
        id: 1,
        name: "First Step",
        description: "Add your first transaction",
        icon: "🎯",
        unlocked: hasTransactions,
        unlockedDate: hasTransactions
          ? new Date(Math.min(...transactions.map((t) => new Date(t.date).getTime()))).toISOString().split("T")[0]
          : undefined,
        progress: hasTransactions ? 100 : 0,
      },
      {
        id: 2,
        name: "Budget Master",
        description: "Add at least 10 transactions",
        icon: "👑",
        unlocked: transactions.length >= 10,
        progress: Math.min((transactions.length / 10) * 100, 100),
      },
      {
        id: 3,
        name: "Saving Spree",
        description: "Save 50% of your income in a month",
        icon: "💰",
        unlocked: currentMonthHasTransactions && savingsRate >= 0.5,
        progress: Math.min(savingsRate * 100, 100),
      },
      {
        id: 4,
        name: "Daily Tracker",
        description: "Log transactions for 7 different days",
        icon: "📅",
        unlocked: new Set(transactions.map((t) => t.date)).size >= 7,
        progress: Math.min((new Set(transactions.map((t) => t.date)).size / 7) * 100, 100),
      },
      {
        id: 5,
        name: "Big Spender",
        description: "Record a transaction of 10,000 or more",
        icon: "💸",
        unlocked: transactions.some((t) => Math.abs(t.amount) >= 10000),
        progress: transactions.some((t) => Math.abs(t.amount) >= 10000) ? 100 : 0,
      },
      {
        id: 6,
        name: "Consistent Logger",
        description: "Add at least 5 transactions this month",
        icon: "📊",
        unlocked: currentMonthTransactions.length >= 5,
        progress: Math.min((currentMonthTransactions.length / 5) * 100, 100),
      },
    ]
  }, [transactions])

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length
  const totalPoints = useMemo(() => {
    return unlockedAchievements * 25
  }, [unlockedAchievements])

  const getCurrentBadge = () => {
    if (totalPoints >= 500)
      return { level: "Gold", icon: "🥇", color: "from-yellow-300 to-yellow-500", nextPoints: null }
    if (totalPoints >= 250) return { level: "Silver", icon: "🥈", color: "from-gray-300 to-gray-400", nextPoints: 500 }
    return { level: "Bronze", icon: "🥉", color: "from-orange-400 to-amber-500", nextPoints: 250 }
  }

  const currentBadge = getCurrentBadge()

  const userRank = useMemo(() => {
    const sortedLeaderboard = [
      ...LEADERBOARD_USERS,
      {
        id: 0,
        name: "You",
        points: totalPoints,
        avatar: "🎮",
        level: currentBadge.level,
        badges: unlockedAchievements,
      },
    ].sort((a, b) => b.points - a.points)
    return sortedLeaderboard.findIndex((u) => u.id === 0) + 1
  }, [totalPoints, currentBadge.level, unlockedAchievements])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Rewards & Achievements
          </h1>
          <p className="text-gray-600 text-lg">
            Complete challenges and unlock amazing rewards! You're at{" "}
            <span className="font-bold text-purple-600">{totalPoints} points</span>
          </p>
        </div>

        {/* Level Progress */}
        <Card className="bg-gradient-to-r from-teal-400 to-purple-500 border-0 rounded-2xl p-8 mb-12 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lg opacity-90">Current Level</p>
              <h2 className="text-4xl font-black">
                {currentBadge.icon} {currentBadge.level} Member
              </h2>
            </div>
            <div className="text-center">
              <p className="text-6xl font-black">{totalPoints}</p>
              <p className="text-sm opacity-90">Points</p>
            </div>
          </div>
          <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${currentBadge.nextPoints ? (totalPoints / currentBadge.nextPoints) * 100 : 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            {currentBadge.nextPoints ? (
              <>
                <span>
                  {totalPoints} / {currentBadge.nextPoints} points to{" "}
                  {currentBadge.level === "Bronze" ? "Silver" : "Gold"}
                </span>
                <span>{Math.round((totalPoints / currentBadge.nextPoints) * 100)}%</span>
              </>
            ) : (
              <span>You've reached the highest level!</span>
            )}
          </div>
        </Card>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Medal className="w-8 h-8 text-purple-600" />
            <h3 className="text-2xl font-black text-gray-800">Community Leaderboard</h3>
          </div>
          {totalPoints > 0 ? (
            <Card className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Your Rank</p>
                    <p className="text-4xl font-black">#{userRank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90 mb-1">Total Points</p>
                    <p className="text-4xl font-black">{totalPoints}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {LEADERBOARD_USERS.slice(0, 8).map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        index < 3
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300"
                          : "bg-gray-50 border-2 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-white ${
                            index === 0
                              ? "bg-yellow-500 text-2xl"
                              : index === 1
                                ? "bg-gray-400 text-xl"
                                : index === 2
                                  ? "bg-orange-500 text-lg"
                                  : "bg-purple-400 text-base"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="text-3xl">{user.avatar}</div>
                        <div>
                          <p className="font-bold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-600">
                            {user.level} • {user.badges} badges
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-purple-600">{user.points}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-12 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-20 h-20 text-gray-400" />
              </div>
              <div className="relative opacity-30">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Leaderboard Locked</h3>
              </div>
              <div className="relative z-10 mt-6">
                <p className="text-gray-700 font-bold mb-4">
                  Earn your first achievement to unlock the community leaderboard!
                </p>
                <p className="text-sm text-gray-600">Start by adding transactions to earn points and badges.</p>
              </div>
            </Card>
          )}
        </div>

        {/* Badges Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-gray-800 mb-6">Badge Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { level: "Bronze", points: 25, color: "from-orange-400 to-amber-500", icon: "🥉" },
              { level: "Silver", points: 250, color: "from-gray-300 to-gray-400", icon: "🥈" },
              { level: "Gold", points: 500, color: "from-yellow-300 to-yellow-500", icon: "🥇" },
            ].map((badge) => (
              <Card
                key={badge.level}
                className={`rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow ${
                  totalPoints >= badge.points
                    ? `bg-gradient-to-br ${badge.color} border-0`
                    : "bg-gray-200 border-2 border-gray-300 relative overflow-hidden"
                }`}
              >
                {totalPoints < badge.points && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className={`text-6xl text-center mb-4 ${totalPoints < badge.points ? "opacity-30" : ""}`}>
                  {badge.icon}
                </div>
                <h4
                  className={`text-2xl font-bold text-center mb-2 ${totalPoints < badge.points ? "text-gray-700" : ""}`}
                >
                  {badge.level}
                </h4>
                <p className={`text-center mb-6 ${totalPoints < badge.points ? "text-gray-600" : "opacity-90"}`}>
                  Requires {badge.points} points
                </p>
                <div
                  className={`rounded-full px-4 py-2 text-center ${totalPoints < badge.points ? "bg-gray-300" : "bg-white/30"}`}
                >
                  <p className={`text-sm font-bold ${totalPoints < badge.points ? "text-gray-700" : ""}`}>
                    {totalPoints >= badge.points ? `✓ Earned` : `${badge.points - totalPoints} points away`}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-gray-800 mb-6">Achievements</h3>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`rounded-2xl p-6 border-2 transition-all ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg"
                      : "bg-gray-100 border-gray-300 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{achievement.icon}</span>
                    {achievement.unlocked ? (
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2">{achievement.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden border border-gray-400">
                      <div className="h-full bg-purple-500" style={{ width: `${achievement.progress}%` }}></div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <p className="text-xs text-green-600 font-bold">Unlocked on {achievement.unlockedDate}</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-2 border-gray-300 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No achievements yet!</h3>
              <p className="text-gray-600">Start adding transactions to unlock achievements and earn points.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
