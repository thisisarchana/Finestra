import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createServerClient } from "@/lib/supabase/server"
import { groq } from "@ai-sdk/groq"

export const maxDuration = 30

async function getUserFinancialContext() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user settings
  const { data: settings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle()

  // Get recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get goals
  const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user.id)

  // Calculate spending by category
  const spendingByCategory: Record<string, number> = {}
  let totalSpending = 0

  transactions?.forEach((t) => {
    if (t.type === "expense") {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount
      totalSpending += t.amount
    }
  })

  return {
    userName: settings?.user_name || "there",
    monthlyBudget: settings?.monthly_budget || 0,
    totalSpending,
    spendingByCategory,
    goals: goals?.map((g) => ({
      title: g.title,
      target: g.target_amount,
      current: g.current_amount,
      completed: g.completed,
    })),
    recentTransactions: transactions?.slice(0, 5).map((t) => ({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
    })),
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Get user's financial context
  const context = await getUserFinancialContext()

  const systemPrompt = context
    ? `You are a helpful financial advisor AI assistant for a gamified finance app called Finestra. 

USER'S FINANCIAL CONTEXT:
- Name: ${context.userName}
- Monthly Budget: ₹${context.monthlyBudget.toLocaleString("en-IN")}
- Total Spending This Month: ₹${context.totalSpending.toLocaleString("en-IN")}
- Remaining Budget: ₹${(context.monthlyBudget - context.totalSpending).toLocaleString("en-IN")}

SPENDING BY CATEGORY:
${Object.entries(context.spendingByCategory)
  .map(([cat, amount]) => `- ${cat}: ₹${amount.toLocaleString("en-IN")}`)
  .join("\n")}

SAVINGS GOALS:
${
  context.goals && context.goals.length > 0
    ? context.goals
        .map(
          (g) =>
            `- ${g.title}: ₹${g.current.toLocaleString("en-IN")}/₹${g.target.toLocaleString("en-IN")} (${((g.current / g.target) * 100).toFixed(1)}% complete)${g.completed ? " ✓ COMPLETED" : ""}`,
        )
        .join("\n")
    : "No active goals"
}

RECENT TRANSACTIONS:
${
  context.recentTransactions && context.recentTransactions.length > 0
    ? context.recentTransactions
        .map(
          (t) =>
            `- ${t.type === "expense" ? "-" : "+"}₹${t.amount.toLocaleString("en-IN")} - ${t.description} (${t.category})`,
        )
        .join("\n")
    : "No recent transactions"
}

IMPORTANT: Always use Indian Rupees (₹) in your responses. Format large numbers using Indian numbering system (lakhs, crores) when appropriate.

Your role is to:
1. Help users set realistic savings goals based on their spending patterns
2. Provide actionable tips to reduce spending in specific categories
3. Encourage positive financial behavior and celebrate milestones
4. Suggest budget adjustments when needed
5. Be supportive, encouraging, and gamified in your responses
6. Use Indian Rupees (₹) and Indian context for all financial recommendations

Be specific and personalized using the context above. Keep responses concise (2-3 paragraphs max).`
    : `You are a helpful financial advisor AI assistant for a gamified finance app. Help users with budgeting, savings goals, and money management tips. Always use Indian Rupees (₹) in your responses. Be encouraging and supportive!`

  const prompt = convertToModelMessages([
    { id: "system", role: "system", parts: [{ type: "text", text: systemPrompt }] },
    ...messages,
  ])

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    prompt,
    abortSignal: req.signal,
    temperature: 0.7,
    maxTokens: 1000,
  })

  return result.toUIMessageStreamResponse()
}
