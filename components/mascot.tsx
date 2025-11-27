"use client"

interface MascotProps {
  mood?: "happy" | "excited" | "neutral" | "celebrating"
}

export default function Mascot({ mood = "happy" }: MascotProps) {
  const moodEmoji = {
    happy: "😊",
    excited: "🤩",
    neutral: "🙂",
    celebrating: "🎉",
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-[#00b4d8] via-[#90e0ef] to-[#caf0f8] rounded-full w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
        <span className="text-5xl md:text-6xl">{moodEmoji[mood]}</span>
      </div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md">
        <p className="text-xs md:text-sm font-bold text-[#0077b6]">Keep going!</p>
      </div>
    </div>
  )
}
