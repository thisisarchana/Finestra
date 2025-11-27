"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Trash2, Plus } from "lucide-react"
import { formatRupees } from "@/lib/currency"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const SUGGESTED_GOALS = [
  { name: "Emergency Fund", emoji: "🏦", target: 100000, category: "Savings" },
  { name: "Vacation Trip", emoji: "✈️", target: 75000, category: "Travel" },
  { name: "New Laptop", emoji: "💻", target: 60000, category: "Tech" },
  { name: "Wedding Fund", emoji: "💍", target: 500000, category: "Life Event" },
  { name: "Car Down Payment", emoji: "🚗", target: 200000, category: "Vehicle" },
  { name: "Home Renovation", emoji: "🏠", target: 300000, category: "Home" },
  { name: "Education Course", emoji: "📚", target: 50000, category: "Education" },
  { name: "New Phone", emoji: "📱", target: 40000, category: "Tech" },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    current: "",
    deadline: "",
    emoji: "🎯",
  })

  const deleteGoal = (id: number) => {
    setGoals(goals.filter((g) => g.id !== id))
  }

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      alert("Please fill in all required fields")
      return
    }

    const goal = {
      id: Date.now(),
      name: newGoal.name,
      target: Number.parseFloat(newGoal.target),
      current: newGoal.current ? Number.parseFloat(newGoal.current) : 0,
      deadline: newGoal.deadline,
      emoji: newGoal.emoji,
    }

    setGoals([goal, ...goals])
    setNewGoal({ name: "", target: "", current: "", deadline: "", emoji: "🎯" })
    setIsDialogOpen(false)
    setShowSuggestions(true)
  }

  const selectSuggestedGoal = (goal: (typeof SUGGESTED_GOALS)[0]) => {
    setNewGoal({
      name: goal.name,
      emoji: goal.emoji,
      target: goal.target.toString(),
      current: "",
      deadline: "",
    })
    setShowSuggestions(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3">
              <Target className="w-10 h-10 text-purple-600" />
              Financial Goals
            </h1>
            <p className="text-gray-600 mt-2">Track your savings goals and celebrate when you reach them!</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:shadow-lg transition-shadow">
                <Plus className="w-5 h-5" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-gray-800">Create New Goal</DialogTitle>
              </DialogHeader>
              {showSuggestions ? (
                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Choose a suggested goal or create your own</p>
                    <Button variant="outline" size="sm" onClick={() => setShowSuggestions(false)} className="font-bold">
                      Create Custom Goal
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {SUGGESTED_GOALS.map((goal, index) => (
                      <Card
                        key={index}
                        className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-purple-200 hover:border-purple-400"
                        onClick={() => selectSuggestedGoal(goal)}
                      >
                        <div className="text-3xl mb-2">{goal.emoji}</div>
                        <h4 className="font-bold text-gray-800 mb-1">{goal.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{goal.category}</p>
                        <p className="text-xs font-bold text-purple-600">{formatRupees(goal.target)}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSuggestions(true)
                        setNewGoal({ name: "", target: "", current: "", deadline: "", emoji: "🎯" })
                      }}
                      className="text-purple-600 font-bold"
                    >
                      ← Back to Suggestions
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-name">Goal Name *</Label>
                    <Input
                      id="goal-name"
                      placeholder="e.g., Vacation Fund"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-emoji">Emoji</Label>
                    <Input
                      id="goal-emoji"
                      placeholder="🎯"
                      value={newGoal.emoji}
                      onChange={(e) => setNewGoal({ ...newGoal, emoji: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">Target Amount (₹) *</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      placeholder="e.g., 50000"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-current">Current Amount (₹)</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      placeholder="e.g., 10000"
                      value={newGoal.current}
                      onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-deadline">Deadline *</Label>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={addGoal}
                      className="bg-gradient-to-r from-teal-500 to-purple-500 text-white font-bold"
                    >
                      Create Goal
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100
              const daysLeft = Math.ceil(
                (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )

              return (
                <Card
                  key={goal.id}
                  className="bg-white border-2 border-purple-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{goal.emoji}</div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-800">{goal.name}</h3>
                        <p className="text-gray-600">
                          Target: <span className="font-bold text-green-600">{formatRupees(goal.target)}</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-gray-700">
                        Progress: {formatRupees(goal.current)} of {formatRupees(goal.target)}
                      </span>
                      <span className="text-sm font-bold bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden border-2 border-purple-200">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${progress}%` }}
                      >
                        {progress > 10 && <span className="text-xs font-bold text-white">{progress.toFixed(0)}%</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-bold ${daysLeft > 30 ? "text-green-600" : daysLeft > 7 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {daysLeft} days left
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {formatRupees(goal.target - goal.current)} needed to reach goal
                    </span>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="bg-white border-2 border-purple-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No goals yet!</h3>
              <p className="text-gray-600 mb-6">Create your first financial goal to get started.</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-teal-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:shadow-lg transition-shadow">
                    <Plus className="w-5 h-5" />
                    Create Your First Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-gray-800">Create New Goal</DialogTitle>
                  </DialogHeader>
                  {showSuggestions ? (
                    <div className="space-y-4 py-4">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">Choose a suggested goal or create your own</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSuggestions(false)}
                          className="font-bold"
                        >
                          Create Custom Goal
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {SUGGESTED_GOALS.map((goal, index) => (
                          <Card
                            key={index}
                            className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-purple-200 hover:border-purple-400"
                            onClick={() => selectSuggestedGoal(goal)}
                          >
                            <div className="text-3xl mb-2">{goal.emoji}</div>
                            <h4 className="font-bold text-gray-800 mb-1">{goal.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{goal.category}</p>
                            <p className="text-xs font-bold text-purple-600">{formatRupees(goal.target)}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowSuggestions(true)
                            setNewGoal({ name: "", target: "", current: "", deadline: "", emoji: "🎯" })
                          }}
                          className="text-purple-600 font-bold"
                        >
                          ← Back to Suggestions
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-name">Goal Name *</Label>
                        <Input
                          id="goal-name"
                          placeholder="e.g., Vacation Fund"
                          value={newGoal.name}
                          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-emoji">Emoji</Label>
                        <Input
                          id="goal-emoji"
                          placeholder="🎯"
                          value={newGoal.emoji}
                          onChange={(e) => setNewGoal({ ...newGoal, emoji: e.target.value })}
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-target">Target Amount (₹) *</Label>
                        <Input
                          id="goal-target"
                          type="number"
                          placeholder="e.g., 50000"
                          value={newGoal.target}
                          onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-current">Current Amount (₹)</Label>
                        <Input
                          id="goal-current"
                          type="number"
                          placeholder="e.g., 10000"
                          value={newGoal.current}
                          onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="goal-deadline">Deadline *</Label>
                        <Input
                          id="goal-deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={addGoal}
                          className="bg-gradient-to-r from-teal-500 to-purple-500 text-white font-bold"
                        >
                          Create Goal
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </Card>
          )}
        </div>

        {goals.length > 0 && (
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl p-8 mt-8 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">🚀</span>
              <h3 className="text-2xl font-black text-gray-800">You're doing amazing!</h3>
            </div>
            <p className="text-gray-700 font-medium">
              You have {goals.length} active {goals.length === 1 ? "goal" : "goals"} with an average progress of{" "}
              {Math.round((goals.reduce((sum, g) => sum + g.current / g.target, 0) / goals.length) * 100)}%. Keep up the
              great work and you'll reach all your goals! 💪
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
