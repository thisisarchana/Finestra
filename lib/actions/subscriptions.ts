"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Subscription = {
  id: string
  user_id: string
  name: string
  amount: number
  renewal_date: string
  icon: string
  created_at: string
  updated_at: string
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function addSubscription(subscription: {
  name: string
  amount: number
  renewal_date: string
  icon: string
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      ...subscription,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard")
  return data
}

export async function deleteSubscription(id: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("subscriptions").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard")
}
