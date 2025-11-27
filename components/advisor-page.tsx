"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Sparkles, TrendingUp, Target, PiggyBank } from "lucide-react"
import { useState } from "react"

const SUGGESTED_PROMPTS = [
  { icon: Target, text: "Help me set a savings goal", color: "from-[#0F4C81] to-[#2E3A4B]" },
  { icon: TrendingUp, text: "How can I reduce my spending?", color: "from-[#0F4C81] to-[#2E3A4B]" },
  { icon: PiggyBank, text: "Tips to save more money", color: "from-[#0F4C81] to-[#2E3A4B]" },
]

export default function AdvisorPage() {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat-advisor" }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && status !== "in_progress") {
      sendMessage({ text: input })
      setInput("")
    }
  }

  const handleSuggestedPrompt = (text: string) => {
    if (status !== "in_progress") {
      sendMessage({ text })
    }
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">AI Financial Advisor</h1>
          <p className="text-secondary">Get personalized tips to save money and reach your goals</p>
        </div>

        {/* Chat Container */}
        <Card className="bg-white border-2 border-[#91A8D0] shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">Welcome to your AI Financial Advisor!</h3>
                  <p className="text-secondary mb-6">
                    Ask me anything about budgeting, saving money, or reaching your financial goals.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                  {SUGGESTED_PROMPTS.map((prompt, index) => {
                    const Icon = prompt.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        className="p-4 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#2E3A4B] text-white hover:scale-105 transition-transform shadow-md"
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">{prompt.text}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] text-white"
                          : "bg-gray-100 text-black border-2 border-secondary/30"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <p key={index} className="whitespace-pre-wrap leading-relaxed">
                              {part.text}
                            </p>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {status === "in_progress" && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 border-2 border-secondary/30 rounded-2xl px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-[#0F4C81] rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[#0F4C81] rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t-2 border-secondary/20 bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                disabled={status === "in_progress"}
                className="flex-1 px-4 py-3 border-2 border-secondary/30 rounded-xl focus:outline-none focus:border-[#0F4C81] transition-colors disabled:opacity-50 text-black placeholder:text-secondary"
              />
              <Button
                type="submit"
                disabled={!input.trim() || status === "in_progress"}
                className="bg-gradient-to-r from-[#0F4C81] to-[#2E3A4B] hover:from-[#0F4C81]/90 hover:to-[#2E3A4B]/90 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
