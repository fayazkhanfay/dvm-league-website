import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
