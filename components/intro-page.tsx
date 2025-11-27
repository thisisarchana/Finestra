"use client"

import { Button } from "@/components/ui/button"

interface IntroPageProps {
  onStart: () => void
}

export default function IntroPage({ onStart }: IntroPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden dark">
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-magenta-500/20 to-purple-500/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-l from-pink-500/15 to-purple-500/5 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="absolute top-20 left-10 w-3 h-3 bg-yellow-400 rounded-full opacity-60"></div>
      <div className="absolute top-32 right-20 w-4 h-4 bg-pink-400 rounded-full opacity-50"></div>
      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-cyan-300 rounded-full opacity-70"></div>
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full opacity-60"></div>
      <div className="absolute top-2/3 left-1/4 w-4 h-4 bg-yellow-300 rounded-full opacity-50"></div>

      <div
        className="absolute top-1/2 right-1/4 w-6 h-6 border-2 border-pink-400 opacity-40 pointer-events-none"
        style={{ transform: "rotate(45deg)" }}
      ></div>
      <div
        className="absolute bottom-1/4 right-1/3 w-5 h-1 bg-cyan-400 rounded opacity-50 pointer-events-none"
        style={{ transform: "rotate(15deg)" }}
      ></div>
      <div
        className="absolute top-1/3 right-20 w-5 h-1 bg-orange-400 rounded opacity-50 pointer-events-none"
        style={{ transform: "rotate(-30deg)" }}
      ></div>

      <div className="relative z-10 max-w-2xl text-center">
        {/* Hero Title */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-black text-balance leading-tight mb-4 text-white">
            Budget smarter.
          </h1>
          <h2 className="text-6xl md:text-7xl font-black text-balance leading-tight mb-6">
            <span className="bg-gradient-to-r from-cyan-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
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
            onClick={onStart}
            className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all border-0"
          >
            Get Started
          </Button>
        </div>

        {/* Phone Mockup or Preview Element */}
        <div className="relative mx-auto max-w-sm mb-8">
          <div className="bg-gradient-to-br from-blue-800 to-purple-800 rounded-3xl p-1 shadow-2xl">
            <div className="bg-black rounded-2xl p-4 space-y-3">
              <div className="h-2 bg-gradient-to-r from-orange-400 to-cyan-400 rounded-full w-3/4 mx-auto opacity-60"></div>
              <div className="space-y-2 px-4">
                <div className="h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-70"></div>
                <div className="h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg opacity-70"></div>
                <div className="h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg opacity-70"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-gray-900 rounded-full px-6 py-3 font-bold text-sm shadow-lg mb-8">
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
