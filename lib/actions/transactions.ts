"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Transaction = {
  id: string
  user_id: string
  date: string
  name: string
  category: string
  amount: number
  icon: string
  created_at: string
  updated_at: string
}

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) throw error
  return data || []
}

export async function addTransaction(transaction: {
  date: string
  name: string
  category: string
  amount: number
  icon: string
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      ...transaction,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard")
  return data
}

export async function deleteTransaction(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard")
}

export async function clearAllTransactions() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("transactions").delete().eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard")
}
