// DATABASE REMINDER: The profiles table requires a stripe_customer_id column
// for the "Saved Card" feature to work fully. This enables returning customers
// to use their saved payment methods automatically.

import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()

    // Auth Check: Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Auth error in checkout:", authError)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Get Case ID from search params
    const searchParams = request.nextUrl.searchParams
    const caseId = searchParams.get("case_id")

    if (!caseId) {
      console.error("[v0] No case_id provided to checkout")
      return NextResponse.redirect(new URL("/gp-dashboard", request.url))
    }

    console.log("[v0] Processing checkout for case:", caseId, "user:", user.id)

    // Get Customer ID: Query profiles table for existing stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError)
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    })

    // Prepare customer handling
    const customerConfig: any = {}
    if (profile?.stripe_customer_id) {
      // Returning customer - use existing customer ID
      customerConfig.customer = profile.stripe_customer_id
      console.log("[v0] Using existing Stripe customer:", profile.stripe_customer_id)
    } else {
      // New customer - create during checkout
      customerConfig.customer_email = user.email
      customerConfig.customer_creation = "always"
      console.log("[v0] Creating new Stripe customer for:", user.email)
    }

    // Create Checkout Session
    const origin = request.nextUrl.origin
    const session = await stripe.checkout.sessions.create({
      ...customerConfig,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Complete Case Consult",
            },
            unit_amount: 39500, // $395.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        setup_future_usage: "on_session", // Save card for future use
      },
      metadata: {
        case_id: caseId,
        gp_id: user.id,
      },
      success_url: `${origin}/submit-success?case_id=${caseId}`,
      cancel_url: `${origin}/gp-dashboard`,
    })

    console.log("[v0] Stripe checkout session created:", session.id)

    // Redirect to Stripe Checkout
    if (!session.url) {
      throw new Error("No checkout URL returned from Stripe")
    }

    return NextResponse.redirect(session.url)
  } catch (error) {
    console.error("[v0] Stripe checkout error:", error)
    return NextResponse.redirect(new URL("/gp-dashboard?error=checkout_failed", request.url))
  }
}
