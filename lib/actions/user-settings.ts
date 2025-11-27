"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type UserSettings = {
  id: string
  user_id: string
  monthly_budget: number
  user_name: string | null
  created_at: string
  updated_at: string
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle()

  if (error) throw error
  return data
}

export async function updateUserSettings(settings: {
  monthly_budget?: number
  user_name?: string
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if settings exist
  const existing = await getUserSettings()

  if (existing) {
    // Update existing settings
    const { data, error } = await supabase
      .from("user_settings")
      .update(settings)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/dashboard")
    return data
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        ...settings,
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath("/dashboard")
    return data
  }
}
