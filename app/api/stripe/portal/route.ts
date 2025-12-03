import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()

    // Check Auth: Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Auth error in portal:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch User Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    // Check: If profile.stripe_customer_id is missing
    if (!profile?.stripe_customer_id) {
      console.log("[v0] No stripe_customer_id found for user:", user.id)
      return NextResponse.json({ error: "No billing history found." }, { status: 400 })
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    })

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/settings`,
    })

    console.log("[v0] Stripe portal session created:", session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[v0] Stripe portal error:", error)
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 })
  }
}
